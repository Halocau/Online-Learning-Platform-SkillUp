"""
Parallel processing module: Chia video/audio thành chunks và transcribe song song
"""
import subprocess
import tempfile
import bisect
from pathlib import Path
from typing import List, Dict, Any, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed
from .config import (
    PARALLEL_PROCESSING_ENABLED, PARALLEL_CHUNK_DURATION, 
    PARALLEL_MIN_DURATION, PARALLEL_MAX_WORKERS,
    LANGUAGE, DEVICE, COMPUTE_TYPE, WHISPER_MODEL
)
from .audio import ffprobe_duration, extract_wav
from .transcribe import transcribe_with_confidence
from .model_cache import model_cache
from .logger import setup_logger

logger = setup_logger('parallel')

def split_audio_into_chunks(
    video_path: Path,
    chunk_duration: float,
    temp_dir: Path
) -> List[Tuple[Path, float, float]]:
    """
    Chia video/audio thành các chunks.
    
    Returns:
        List of (chunk_wav_path, start_time, end_time) tuples
    """
    duration = ffprobe_duration(video_path, use_cache=True)
    
    if duration <= 0:
        raise ValueError(f"Cannot determine duration of {video_path}")
    
    chunks = []
    chunk_idx = 0
    start_time = 0.0
    
    while start_time < duration:
        end_time = min(start_time + chunk_duration, duration)
        chunk_wav = temp_dir / f"chunk_{chunk_idx:03d}.wav"
        
        # Extract chunk với ffmpeg
        # -ss trước -i để seek nhanh hơn (input seeking)
        # -t: duration
        cmd = [
            "ffmpeg", "-y", "-ss", str(start_time),
            "-i", str(video_path),
            "-t", str(end_time - start_time),
            "-ac", "1", "-ar", "16000", "-vn",
            str(chunk_wav)
        ]
        
        try:
            subprocess.run(
                cmd, 
                check=True, 
                stdout=subprocess.DEVNULL, 
                stderr=subprocess.DEVNULL,
                timeout=300
            )
            chunks.append((chunk_wav, start_time, end_time))
            logger.debug(
                f"Created chunk {chunk_idx}: {start_time:.2f}s - {end_time:.2f}s",
                extra={'extra_data': {
                    'chunk_idx': chunk_idx,
                    'start_time': start_time,
                    'end_time': end_time,
                    'chunk_path': str(chunk_wav)
                }}
            )
        except subprocess.CalledProcessError as e:
            logger.error(
                f"Failed to create chunk {chunk_idx}",
                extra={'extra_data': {
                    'chunk_idx': chunk_idx,
                    'start_time': start_time,
                    'end_time': end_time,
                    'error': str(e)
                }}
            )
            raise
        
        start_time = end_time
        chunk_idx += 1
    
    return chunks

def transcribe_chunk(
    chunk_info: Tuple[Path, float, float],
    model_name: str,
    context: str
) -> Tuple[List[Dict[str, Any]], float]:
    """
    Transcribe một chunk và trả về segments với timestamps đã được điều chỉnh.
    
    Args:
        chunk_info: (chunk_wav_path, start_time, end_time)
        model_name: Whisper model name
        context: Context for transcription
    
    Returns:
        (segments_with_offset, chunk_start_time)
    """
    chunk_wav, chunk_start, chunk_end = chunk_info
    
    try:
        model = model_cache.get_model(model_name, DEVICE, COMPUTE_TYPE)
        segs, info = transcribe_with_confidence(
            model,
            str(chunk_wav),
            language=LANGUAGE,
            context=context
        )
        
        # Điều chỉnh timestamps: cộng thêm chunk_start
        adjusted_segs = []
        for seg in segs:
            adjusted_seg = {
                **seg,
                "start": seg["start"] + chunk_start,
                "end": seg["end"] + chunk_start
            }
            # Điều chỉnh word timestamps nếu có
            if "words" in seg and seg["words"]:
                adjusted_seg["words"] = [
                    {
                        **w,
                        "start": w["start"] + chunk_start,
                        "end": w["end"] + chunk_start
                    }
                    for w in seg["words"]
                ]
            adjusted_segs.append(adjusted_seg)
        
        logger.debug(
            f"Transcribed chunk: {chunk_start:.2f}s - {chunk_end:.2f}s, {len(adjusted_segs)} segments",
            extra={'extra_data': {
                'chunk_start': chunk_start,
                'chunk_end': chunk_end,
                'segments_count': len(adjusted_segs)
            }}
        )
        
        return adjusted_segs, chunk_start
        
    except Exception as e:
        logger.error(
            f"Error transcribing chunk {chunk_start:.2f}s - {chunk_end:.2f}s",
            extra={'extra_data': {
                'chunk_start': chunk_start,
                'chunk_end': chunk_end,
                'error': str(e)
            }}
        )
        raise

def transcribe_parallel(
    video_path: Path,
    model_name: str,
    context: str,
    chunk_duration: float,
    max_workers: int,
    wav_path: Path | None = None,
    use_denoise: bool = False,
    channel: str = "auto"
) -> Tuple[List[Dict[str, Any]], dict]:
    """
    Transcribe video/audio bằng cách chia thành chunks và xử lý song song.
    
    Args:
        video_path: Path to video/audio file (dùng để lấy duration nếu wav_path không có)
        model_name: Whisper model name
        context: Context for transcription
        chunk_duration: Duration of each chunk in seconds
        max_workers: Maximum number of parallel workers
        wav_path: Optional pre-extracted WAV file (nếu có sẽ tái sử dụng, không extract lại)
        use_denoise: Whether to use denoise (chỉ dùng nếu wav_path không có)
        channel: Audio channel to use (chỉ dùng nếu wav_path không có)
    
    Returns:
        (all_segments, info_dict)
    """
    import time
    start_time = time.time()
    
    logger.info(
        f"Starting parallel transcription",
        extra={'extra_data': {
            'video_path': str(video_path),
            'wav_path': str(wav_path) if wav_path else None,
            'model': model_name,
            'chunk_duration': chunk_duration,
            'max_workers': max_workers
        }}
    )
    
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # Sử dụng wav_path đã extract nếu có, nếu không thì extract mới
        if wav_path and wav_path.exists():
            full_wav = wav_path
            logger.debug(
                f"Reusing pre-extracted audio: {wav_path}",
                extra={'extra_data': {'wav_path': str(wav_path)}}
            )
        else:
            # Extract full audio first (cần cho denoise và channel selection)
            full_wav = temp_path / "full_audio.wav"
            extract_wav(video_path, full_wav, denoise=use_denoise, channel=channel)
            logger.debug(
                f"Extracted audio for parallel processing",
                extra={'extra_data': {
                    'full_wav': str(full_wav),
                    'use_denoise': use_denoise,
                    'channel': channel
                }}
            )
        
        # Chia thành chunks từ full audio đã được xử lý
        chunks = split_audio_into_chunks(full_wav, chunk_duration, temp_path)
        
        if not chunks:
            raise ValueError("No chunks created")
        
        logger.info(
            f"Split into {len(chunks)} chunks",
            extra={'extra_data': {
                'chunks_count': len(chunks),
                'chunk_duration': chunk_duration
            }}
        )
        
        # Transcribe song song - collect tất cả segments trước, sau đó sort một lần (tối ưu hơn)
        all_segments = []  # Collect tất cả segments
        completed_chunks = 0
        
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit all tasks
            future_to_chunk = {
                executor.submit(transcribe_chunk, chunk_info, model_name, context): chunk_info
                for chunk_info in chunks
            }
            
            # Collect results as they complete
            for future in as_completed(future_to_chunk):
                chunk_info = future_to_chunk[future]
                try:
                    segs, chunk_start = future.result()
                    completed_chunks += 1
                    
                    # Thêm tất cả segments vào list (không sort ngay)
                    all_segments.extend(segs)
                    
                    logger.debug(
                        f"Chunk completed: {chunk_start:.2f}s ({completed_chunks}/{len(chunks)} chunks)",
                        extra={'extra_data': {
                            'chunk_start': chunk_start,
                            'completed_chunks': completed_chunks,
                            'total_chunks': len(chunks),
                            'segments_added': len(segs),
                            'total_segments_so_far': len(all_segments)
                        }}
                    )
                except Exception as e:
                    logger.error(
                        f"Chunk transcription failed",
                        extra={'extra_data': {
                            'chunk_info': chunk_info,
                            'error': str(e)
                        }}
                    )
                    raise
        
        # Sort tất cả segments một lần sau khi collect xong (O(n log n) thay vì O(n²))
        all_segments.sort(key=lambda x: x["start"])
        
        total_time = time.time() - start_time
        
        # Lấy duration để hiển thị trong log
        video_duration = ffprobe_duration(video_path, use_cache=True)
        video_duration_minutes = round(video_duration / 60, 2)
        
        # Tạo info dict tương tự như transcribe_with_confidence
        info_dict = {
            "language": LANGUAGE,
            "duration": video_duration,
            "chunks_count": len(chunks),
            "parallel_time_seconds": round(total_time, 2)
        }
        
        logger.info(
            f"Parallel transcription complete - Video: {video_duration_minutes} phút",
            extra={'extra_data': {
                'total_segments': len(all_segments),
                'chunks_count': len(chunks),
                'total_time_seconds': round(total_time, 2),
                'video_duration_seconds': round(video_duration, 2),
                'video_duration_minutes': video_duration_minutes
            }}
        )
        
        return all_segments, info_dict

def should_use_parallel(duration: float) -> bool:
    """
    Quyết định có nên dùng parallel processing không.
    """
    if not PARALLEL_PROCESSING_ENABLED:
        return False
    
    if duration < PARALLEL_MIN_DURATION:
        return False
    
    return True

