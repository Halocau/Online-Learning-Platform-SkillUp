from fastapi import APIRouter, UploadFile, File, Query, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import shutil, tempfile, os
from urllib.parse import urlparse
import asyncio

from ..core.config import (
    UPLOAD_DIR, WHISPER_MODEL, DEVICE, COMPUTE_TYPE, LANGUAGE,
    USE_DENOISE, MAX_FILE_MB, BEAM_SIZE, BEST_OF,
    PARALLEL_PROCESSING_ENABLED, PARALLEL_CHUNK_DURATION,
    PARALLEL_MIN_DURATION, PARALLEL_MAX_WORKERS,
    AUDIO_CHUNK_SIZE_MB, SUBTITLE_MERGE_MAX_GAP, SUBTITLE_MERGE_MIN_DUR,
    SUBTITLE_CONFIDENCE_THRESHOLD, SUBTITLE_SPLIT_MAX_DUR, SUBTITLE_SPLIT_MAX_CHARS,
    SUBTITLE_PRE_AI_MERGE_THRESHOLD, SUBTITLE_PRE_AI_MERGE_MAX_GAP, SUBTITLE_PRE_AI_MERGE_MIN_DUR
)
from ..core.model_cache import model_cache
from ..core.validation import validate_upload_file, validate_file_type
from ..core.logger import setup_logger, log_performance, log_error_with_context
import time
from ..core.audio import extract_wav, audio_metrics_from_wav, auto_select_best_channel
from ..core.subtitle import (
    merge_segments, split_long_segments, post_cleanup_caps,
    write_vtt, write_srt, write_text, norm, merge_all_segments
)
from ..core.transcribe import transcribe_with_confidence
from ..core.vietnamese import looks_like_prompt_leak
from ..core.utils import secure_stem
from ..core.downloader import download_remote_video
from ..core.ai_correction import correct_segments_with_ai
from ..core.parallel import transcribe_parallel, should_use_parallel
from ..core.audio import ffprobe_duration

logger = setup_logger('gensub')
FILE_UPLOAD_REQUEST_BODY = {
    "content": {
        "multipart/form-data": {
            "schema": {
                "type": "object",
                "properties": {
                    "file": {"type": "string", "format": "binary"}
                },
                "required": []  # Make file optional
            }
        }
    }
}

router = APIRouter(prefix="/api", tags=["GenSub"])

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "gensub"}

def _process_transcription_sync(
    video_dest: Path,
    raw_filename: str,
    request_id: str,
    fmt: str,
    model_name: str | None,
    ai_correct: bool,
    size: int,
    mime_type: str | None,
    context: str,
    mode: str,
    channel: str
):
    """
    Synchronous helper function để xử lý transcription sau khi đã có video file.
    Chạy trong thread pool để không block event loop.
    """
    sub_ext = "txt" if fmt == "text" else fmt
    suffix = Path(raw_filename).suffix or '.mp4'
    sub_dest = UPLOAD_DIR / f"{Path(video_dest).stem}.{sub_ext}"
    
    # 3) Extract audio + metrics (tự động tối ưu)
    try:
        audio_start = time.time()
        with tempfile.TemporaryDirectory() as td:
            wav_path = Path(td) / "audio.wav"
            use_denoise = USE_DENOISE
            
            extract_start = time.time()
            extract_wav(video_dest, wav_path, denoise=use_denoise, channel=channel)
            extract_time = time.time() - extract_start
            
            metrics_start = time.time()
            metrics = audio_metrics_from_wav(wav_path)
            metrics_time = time.time() - metrics_start
            used_channel = channel
            
            logger.info(
                f"[{request_id}] Audio extraction complete",
                extra={'extra_data': {
                    'request_id': request_id,
                    'extract_time_seconds': round(extract_time, 2),
                    'metrics_time_seconds': round(metrics_time, 3),
                    'audio_metrics': metrics,
                    'initial_denoise': use_denoise,
                    'initial_channel': channel,
                    'wav_path': str(wav_path)
                }}
            )
            
            # Tự động bật denoise nếu audio kém chất lượng
            if not use_denoise and metrics["suggest_denoise"]:
                logger.info(
                    f"[{request_id}] Auto-enabling denoise based on audio quality",
                    extra={'extra_data': {
                        'request_id': request_id,
                        'reason': 'suggest_denoise=True',
                        'rms_dbfs': metrics['rms_dbfs'],
                        'silence_ratio': metrics['silence_ratio']
                    }}
                )
                denoise_start = time.time()
                extract_wav(video_dest, wav_path, denoise=True, channel=used_channel)
                metrics = audio_metrics_from_wav(wav_path)
                denoise_time = time.time() - denoise_start
                use_denoise = True
                logger.debug(
                    f"[{request_id}] Denoise re-extraction complete",
                    extra={'extra_data': {
                        'request_id': request_id,
                        'denoise_time_seconds': round(denoise_time, 2),
                        'new_metrics': metrics
                    }}
                )
            
            # Tự động chọn channel tốt nhất nếu audio có vấn đề
            channel_test_start = time.time()
            best_wav, best_metrics, selected_channel = auto_select_best_channel(
                video_dest, metrics, Path(td), use_denoise
            )
            
            if best_wav is not None:
                wav_path = best_wav
                metrics = best_metrics
                used_channel = selected_channel
                channel_test_time = time.time() - channel_test_start
                logger.info(
                    f"[{request_id}] Auto-selected {selected_channel} channel",
                    extra={'extra_data': {
                        'request_id': request_id,
                        'channel_test_time_seconds': round(channel_test_time, 2),
                        'selected_channel': selected_channel,
                        'rms_dbfs': metrics['rms_dbfs']
                    }}
                )
            else:
                used_channel = selected_channel
                channel_test_time = time.time() - channel_test_start
                if channel_test_time > 0.1:
                    logger.info(
                        f"[{request_id}] Mix channel is optimal",
                        extra={'extra_data': {
                            'request_id': request_id,
                            'channel_test_time_seconds': round(channel_test_time, 2)
                        }}
                    )
            
            # 4) Transcribe with Vietnamese optimization
            transcribe_start = time.time()
            
            video_duration = ffprobe_duration(video_dest, use_cache=True)
            use_parallel = should_use_parallel(video_duration)
            
            logger.info(
                f"[{request_id}] Starting transcription",
                extra={'extra_data': {
                    'request_id': request_id,
                    'model': model_name or WHISPER_MODEL,
                    'device': DEVICE,
                    'compute_type': COMPUTE_TYPE,
                    'language': LANGUAGE,
                    'context': context,
                    'beam_size': BEAM_SIZE,
                    'best_of': BEST_OF,
                    'video_duration': round(video_duration, 2),
                    'use_parallel': use_parallel,
                    'parallel_enabled': PARALLEL_PROCESSING_ENABLED
                }}
            )
            
            if use_parallel:
                logger.info(
                    f"[{request_id}] Using parallel transcription",
                    extra={'extra_data': {
                        'request_id': request_id,
                        'chunk_duration': PARALLEL_CHUNK_DURATION,
                        'max_workers': PARALLEL_MAX_WORKERS,
                        'video_duration': round(video_duration, 2)
                    }}
                )
                segs, info = transcribe_parallel(
                    video_dest,
                    model_name or WHISPER_MODEL,
                    context,
                    PARALLEL_CHUNK_DURATION,
                    PARALLEL_MAX_WORKERS,
                    wav_path=wav_path,
                    use_denoise=use_denoise,
                    channel=used_channel
                )
                class InfoObj:
                    def __init__(self, d):
                        for k, v in d.items():
                            setattr(self, k, v)
                info = InfoObj(info)
            else:
                model = model_cache.get_model(
                    model_name or WHISPER_MODEL, 
                    DEVICE, 
                    COMPUTE_TYPE
                )
                segs, info = transcribe_with_confidence(
                    model, 
                    str(wav_path), 
                    language=LANGUAGE,
                    context=context
                )
            
            transcribe_time = time.time() - transcribe_start
            
            final_duration = getattr(info, 'duration', video_duration)
            video_duration_minutes = round(final_duration / 60, 2)
            
            logger.info(
                f"[{request_id}] Transcription complete - Video: {video_duration_minutes} phút",
                extra={'extra_data': {
                    'request_id': request_id,
                    'transcription_time_seconds': round(transcribe_time, 2),
                    'segments_count': len(segs),
                    'detected_language': getattr(info, 'language', LANGUAGE),
                    'language_probability': getattr(info, 'language_probability', None),
                    'duration_seconds': round(final_duration, 2),
                    'video_duration_minutes': video_duration_minutes,
                    'used_parallel': use_parallel
                }}
            )
            
            # 5) Post-processing with Vietnamese enhancement
            postprocess_start = time.time()
            
            logger.debug(
                f"[{request_id}] Starting post-processing",
                extra={'extra_data': {
                    'request_id': request_id,
                    'input_segments': len(segs)
                }}
            )
            
            merged = merge_segments(segs, max_gap=SUBTITLE_MERGE_MAX_GAP, min_dur=SUBTITLE_MERGE_MIN_DUR, confidence_threshold=SUBTITLE_CONFIDENCE_THRESHOLD)
            
            logger.debug(
                f"[{request_id}] After merge_segments",
                extra={'extra_data': {
                    'request_id': request_id,
                    'merged_count': len(merged)
                }}
            )
            
            cleaned0 = []
            prompt_leaks = 0
            for i, s in enumerate(merged):
                if i <= 2 and looks_like_prompt_leak(s["text"]):
                    prompt_leaks += 1
                    logger.warning(
                        f"[{request_id}] Filtered prompt leak",
                        extra={'extra_data': {
                            'request_id': request_id,
                            'segment_index': i,
                            'text_preview': s['text'][:50]
                        }}
                    )
                    continue
                cleaned0.append(s)
            
            merged = split_long_segments(cleaned0, max_dur=SUBTITLE_SPLIT_MAX_DUR, max_chars=SUBTITLE_SPLIT_MAX_CHARS)
            merged = post_cleanup_caps(merged)
            
            postprocess_time = time.time() - postprocess_start
            
            logger.info(
                f"[{request_id}] Post-processing complete",
                extra={'extra_data': {
                    'request_id': request_id,
                    'postprocess_time_seconds': round(postprocess_time, 3),
                    'after_merge': len(cleaned0),
                    'after_split': len(merged),
                    'prompt_leaks_filtered': prompt_leaks
                }}
            )
            
            # AI correction if enabled
            if ai_correct:
                ai_start = time.time()
                
                if len(merged) > SUBTITLE_PRE_AI_MERGE_THRESHOLD:
                    before_merge_count = len(merged)
                    logger.info(
                        f"[{request_id}] Pre-AI merge: {before_merge_count} segments → merging for efficiency",
                        extra={'extra_data': {
                            'request_id': request_id,
                            'before_merge': before_merge_count
                        }}
                    )
                    merged = merge_segments(merged, max_gap=SUBTITLE_PRE_AI_MERGE_MAX_GAP, min_dur=SUBTITLE_PRE_AI_MERGE_MIN_DUR, confidence_threshold=0.0)
                    after_merge_count = len(merged)
                    reduction_pct = round((1 - after_merge_count / before_merge_count) * 100, 1) if before_merge_count > 0 else 0
                    logger.info(
                        f"[{request_id}] Pre-AI merge complete: {after_merge_count} segments (reduced {reduction_pct}%)",
                        extra={'extra_data': {
                            'request_id': request_id,
                            'before_merge': before_merge_count,
                            'after_merge': after_merge_count,
                            'reduction_percent': reduction_pct
                        }}
                    )
                
                logger.info(
                    f"[{request_id}] Starting AI correction",
                    extra={'extra_data': {
                        'request_id': request_id,
                        'segments_count': len(merged)
                    }}
                )
                merged = correct_segments_with_ai(merged, batch_size=15)
                ai_time = time.time() - ai_start
                ai_corrected_count = sum(1 for s in merged if s.get('ai_corrected', False))
                logger.info(
                    f"[{request_id}] AI correction complete",
                    extra={'extra_data': {
                        'request_id': request_id,
                        'ai_time_seconds': round(ai_time, 2),
                        'corrected_count': ai_corrected_count,
                        'total_segments': len(merged),
                        'correction_rate': round(ai_corrected_count / len(merged) * 100, 1) if merged else 0
                    }}
                )
            
            if not merged:
                logger.error(
                    f"[{request_id}] No segments after processing",
                    extra={'extra_data': {
                        'request_id': request_id,
                        'original_segments': len(segs),
                        'after_merge': len(cleaned0) if 'cleaned0' in locals() else 0
                    }}
                )
                raise HTTPException(422, "Không trích được thoại từ video. Vui lòng kiểm tra chất lượng audio.")
            
            logger.info(
                f"[{request_id}] Final segments ready",
                extra={'extra_data': {
                    'request_id': request_id,
                    'final_segments_count': len(merged)
                }}
            )
            
            # 6) Write subtitle
            write_start = time.time()
            if fmt == "vtt":
                write_vtt(merged, sub_dest); media_type = "text/vtt"
            elif fmt == "srt":
                write_srt(merged, sub_dest); media_type = "application/x-subrip"
            else:  # fmt == "text"
                merged = merge_all_segments(merged)
                write_text(merged, sub_dest); media_type = "text/plain"
            write_time = time.time() - write_start
            
            total_time = time.time() - audio_start
            
            video_duration = ffprobe_duration(video_dest, use_cache=True)
            video_duration_minutes = round(video_duration / 60, 2)
            
            logger.info(
                f"[{request_id}] Subtitle saved successfully - Video: {video_duration_minutes} phút",
                extra={'extra_data': {
                    'request_id': request_id,
                    'subtitle_path': str(sub_dest),
                    'format': fmt,
                    'write_time_seconds': round(write_time, 3),
                    'total_processing_time_seconds': round(total_time, 2),
                    'video_duration_seconds': round(video_duration, 2),
                    'video_duration_minutes': video_duration_minutes
                }}
            )
            
            log_performance(logger, 'gensub_complete', total_time, **{
                'request_id': request_id,
                'file_size_mb': round(int(size) / 1024 / 1024, 2),
                'segments_count': len(merged),
                'ai_corrected': ai_correct
            })
            
            ai_corrected_count = sum(1 for s in merged if s.get('ai_corrected', False))
            headers = {
                "X-Audio-RMS-dBFS": str(metrics["rms_dbfs"]),
                "X-Silence-Ratio": str(metrics["silence_ratio"]),
                "X-Used-Channel": used_channel,
                "X-Context": context,
                "X-Segments-Count": str(len(merged)),
                "X-AI-Corrected": "1" if ai_correct else "0",
                "X-AI-Corrections": str(ai_corrected_count),
            }
            
            return {
                'sub_dest': sub_dest,
                'media_type': media_type,
                'headers': headers,
                'metrics': metrics,
                'used_channel': used_channel,
                'context': context,
                'merged': merged,
                'ai_correct': ai_correct,
                'ai_corrected_count': ai_corrected_count,
                'mode': mode,
                'video_dest': video_dest,
                'fmt': fmt
            }
    
    except Exception as e:
        total_time = time.time() - audio_start if 'audio_start' in locals() else 0
        log_error_with_context(logger, e, {
            'request_id': request_id if 'request_id' in locals() else 'unknown',
            'operation': 'transcription_processing',
            'total_time_seconds': round(total_time, 2),
            'video_dest': str(video_dest)
        })
        raise HTTPException(500, f"Processing error: {str(e)}")

async def _process_transcription(
    video_dest: Path,
    raw_filename: str,
    request_id: str,
    fmt: str,
    model_name: str | None,
    ai_correct: bool,
    size: int,
    mime_type: str | None
):
    """
    Async wrapper để xử lý transcription sau khi đã có video file.
    Chạy CPU-bound work trong thread pool để không block event loop.
    """
    # Tự động set các giá trị mặc định
    context = "education"
    mode = "file"
    channel = "auto"
    
    try:
        # Chạy CPU-bound transcription work trong thread pool
        result = await asyncio.to_thread(
            _process_transcription_sync,
            video_dest,
            raw_filename,
            request_id,
            fmt,
            model_name,
            ai_correct,
            size,
            mime_type,
            context,
            mode,
            channel
        )
        
        # Cleanup video file after processing
        try:
            if video_dest.exists():
                os.unlink(video_dest)
                logger.debug(f"[{request_id}] Cleaned up source video after processing")
        except FileNotFoundError:
            pass
        except Exception as cleanup_error:
            logger.warning(f"[{request_id}] Failed to cleanup source video: {cleanup_error}")
        
        # Return response
        if result['mode'] == "json":
            return {
                "video_path": str(result['video_dest']),
                "subtitle_path": str(result['sub_dest']),
                "metrics": result['metrics'],
                "used_channel": result['used_channel'],
                "format": result['fmt'],
                "context": result['context'],
                "segments_count": len(result['merged']),
                "ai_corrected": result['ai_correct'],
                "ai_corrections_count": result['ai_corrected_count'],
            }
        
        return FileResponse(
            result['sub_dest'], 
            media_type=result['media_type'], 
            filename=result['sub_dest'].name, 
            headers=result['headers']
        )
    except HTTPException:
        raise
    except Exception as e:
        # Cleanup on error
        try:
            if video_dest.exists():
                os.unlink(video_dest)
        except Exception:
            pass
        log_error_with_context(logger, e, {
            'request_id': request_id,
            'operation': 'transcription_processing',
            'video_dest': str(video_dest)
        })
        raise HTTPException(500, f"Processing error: {str(e)}")

@router.post(
    "/gensub",
    summary="Upload video/audio file → tạo phụ đề tiếng Việt chất lượng cao",
    openapi_extra={"requestBody": FILE_UPLOAD_REQUEST_BODY}
)
async def gensub(
    file: UploadFile = File(..., description=".mp4/.mkv/.mov/.mp3..."),
    fmt: str = Query("text", pattern="^(vtt|srt|text)$", description="Định dạng phụ đề: vtt, srt hoặc text (mặc định: text)"),
    model_name: str | None = Query(None, description="Tùy chọn: Override model (vd: large-v3, medium, small)"),
    ai_correct: bool = Query(False, description="Bật AI correction với Gemini (cần GEMINI_API_KEY)"),
):
    """
    API upload file để tạo phụ đề tiếng Việt.
    
    Tự động xử lý:
    - Denoise: Tự động bật/tắt dựa trên chất lượng audio
    - Channel: Tự động chọn channel tốt nhất (left/right/mix)
    - Context: Tự động tối ưu cho tiếng Việt
    """
    raw_filename = file.filename or "upload.mp4"
    start_time = time.time()
    dest_stem = secure_stem(raw_filename)
    request_id = f"{dest_stem}_{int(start_time)}"
    
    logger.info(
        f"[{request_id}] Starting transcription request (upload)",
        extra={'extra_data': {
            'request_id': request_id,
            'filename': raw_filename,
            'source_type': 'upload',
            'fmt': fmt,
            'model': model_name or WHISPER_MODEL,
            'ai_correct': ai_correct
        }}
    )
    
    suffix = Path(raw_filename).suffix or '.mp4'
    video_dest = UPLOAD_DIR / f"{dest_stem}{suffix}"
    size = 0
    mime_type = None
    tmp_path = None
    
    try:
        validation_start = time.time()
        content, size = await validate_upload_file(file, MAX_FILE_MB)
        validation_time = time.time() - validation_start
        logger.info(
            f"[{request_id}] File validation successful",
            extra={'extra_data': {
                'request_id': request_id,
                'file_size_mb': round(int(size) / 1024 / 1024, 2),
                'validation_time_seconds': round(validation_time, 3)
            }}
        )
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp_path = Path(tmp.name)
            chunk_size = AUDIO_CHUNK_SIZE_MB * 1024 * 1024
            for i in range(0, len(content), chunk_size):
                tmp.write(content[i:i + chunk_size])
        
        file_type_start = time.time()
        is_valid, mime_type = validate_file_type(tmp_path)
        file_type_time = time.time() - file_type_start
        
        if not is_valid:
            logger.error(
                f"[{request_id}] Invalid file type detected",
                extra={'extra_data': {
                    'request_id': request_id,
                    'mime_type': mime_type,
                    'filename': raw_filename,
                    'suffix': suffix
                }}
            )
            try:
                os.unlink(tmp_path)
            except Exception:
                pass
            await file.close()
            raise HTTPException(400, f"Invalid file type: {mime_type}")
        
        shutil.move(str(tmp_path), str(video_dest))
        logger.info(
            f"[{request_id}] File saved successfully",
            extra={'extra_data': {
                'request_id': request_id,
                'video_path': str(video_dest),
                'mime_type': mime_type,
                'file_type_check_time': round(file_type_time, 3)
            }}
        )
        await file.close()
        
        # Process transcription
        return await _process_transcription(
            video_dest, raw_filename, request_id, fmt, model_name, ai_correct, size, mime_type
        )
    except HTTPException:
        raise
    except Exception as e:
        log_error_with_context(logger, e, {
            'request_id': request_id if 'request_id' in locals() else 'unknown',
            'operation': 'file_upload',
            'filename': raw_filename
        })
        if tmp_path and tmp_path.exists():
            try:
                os.unlink(tmp_path)
            except Exception:
                pass
        try:
            await file.close()
        except Exception:
            pass
        raise HTTPException(400, f"Cannot process file: {e}")

@router.post(
    "/gensub-url",
    summary="Tạo phụ đề từ video URL → tạo phụ đề tiếng Việt chất lượng cao"
)
async def gensub_url(
    video_url: str = Query(..., alias="videoUrl", description="URL video HTTP/HTTPS (vd: http://server/video.mp4)"),
    fmt: str = Query("text", pattern="^(vtt|srt|text)$", description="Định dạng phụ đề: vtt, srt hoặc text (mặc định: text)"),
    model_name: str | None = Query(None, description="Tùy chọn: Override model (vd: large-v3, medium, small)"),
    ai_correct: bool = Query(False, description="Bật AI correction với Gemini (cần GEMINI_API_KEY)"),
):
    """
    API tạo phụ đề từ video URL.
    
    Tự động xử lý:
    - Denoise: Tự động bật/tắt dựa trên chất lượng audio
    - Channel: Tự động chọn channel tốt nhất (left/right/mix)
    - Context: Tự động tối ưu cho tiếng Việt
    """
    raw_filename = Path(urlparse(video_url).path).name or "remote_video.mp4"
    start_time = time.time()
    dest_stem = secure_stem(raw_filename)
    request_id = f"{dest_stem}_{int(start_time)}"
    
    logger.info(
        f"[{request_id}] Starting transcription request (remote URL)",
        extra={'extra_data': {
            'request_id': request_id,
            'filename': raw_filename,
            'source_type': 'remote-url',
            'video_url': video_url,
            'fmt': fmt,
            'model': model_name or WHISPER_MODEL,
            'ai_correct': ai_correct
        }}
    )
    
    suffix = Path(raw_filename).suffix or '.mp4'
    video_dest = UPLOAD_DIR / f"{dest_stem}{suffix}"
    size = 0
    mime_type = None
    
    try:
        download_start = time.time()
        size = int(download_remote_video(video_url, video_dest, MAX_FILE_MB))
        download_time = time.time() - download_start
        logger.info(
            f"[{request_id}] Remote video downloaded",
            extra={'extra_data': {
                'request_id': request_id,
                'video_path': str(video_dest),
                'video_url': video_url,
                'download_time_seconds': round(download_time, 2),
                'file_size_mb': round(int(size) / 1024 / 1024, 2) if size else None
            }}
        )
        
        file_type_start = time.time()
        is_valid, mime_type = validate_file_type(video_dest)
        file_type_time = time.time() - file_type_start
        
        if not is_valid:
            logger.error(
                f"[{request_id}] Invalid file type detected (remote)",
                extra={'extra_data': {
                    'request_id': request_id,
                    'mime_type': mime_type,
                    'video_url': video_url
                }}
            )
            try:
                os.unlink(video_dest)
            except Exception:
                pass
            raise HTTPException(400, f"Invalid file type: {mime_type}")
        
        logger.info(
            f"[{request_id}] Remote file type validated",
            extra={'extra_data': {
                'request_id': request_id,
                'mime_type': mime_type,
                'file_type_check_time': round(file_type_time, 3)
            }}
        )
        
        # Process transcription
        return await _process_transcription(
            video_dest, raw_filename, request_id, fmt, model_name, ai_correct, size, mime_type
        )
    except HTTPException:
        raise
    except Exception as e:
        log_error_with_context(logger, e, {
            'request_id': request_id if 'request_id' in locals() else 'unknown',
            'operation': 'remote_download',
            'video_url': video_url
        })
        raise HTTPException(400, f"Cannot download video: {e}")
