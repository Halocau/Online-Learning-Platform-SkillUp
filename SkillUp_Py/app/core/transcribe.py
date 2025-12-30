from typing import List, Tuple, Dict, Any
from fastapi import HTTPException
from .config import BEAM_SIZE, BEST_OF, VAD_MIN_SIL_MS, INITIAL_PROMPT
from .logger import setup_logger, log_error_with_context
import time

logger = setup_logger('transcribe')

def transcribe_with_confidence(
    model, 
    wav_path: str, 
    language: str = "vi",
    context: str = "education"
) -> Tuple[List[Dict[str, Any]], dict]:
    """Enhanced transcription with confidence scores"""
    # Dùng prompt đơn giản từ config
    prompt = INITIAL_PROMPT
    
    logger.info(
        f"Starting transcription",
        extra={'extra_data': {
            'wav_path': wav_path,
            'language': language,
            'context': context,
            'beam_size': BEAM_SIZE,
            'best_of': BEST_OF,
            'vad_min_sil_ms': VAD_MIN_SIL_MS,
            'prompt_length': len(prompt)
        }}
    )
    
    temps = [0.0, 0.2, 0.4]
    
    # Pass 1: Optimal for Vietnamese (try this first, only retry if it fails)
    pass1_start = time.time()
    try:
        logger.debug("Pass 1: Starting transcription with optimal settings")
        segments, info = model.transcribe(
            wav_path, language=language,
            vad_filter=True, vad_parameters=dict(min_silence_duration_ms=VAD_MIN_SIL_MS, speech_pad_ms=120),
            beam_size=BEAM_SIZE, best_of=BEST_OF, temperature=temps,
            condition_on_previous_text=True, initial_prompt=prompt,
            compression_ratio_threshold=2.4, log_prob_threshold=-1.0, no_speech_threshold=0.08,
            word_timestamps=False,  # SPEED: Tắt word timestamps để nhanh hơn 15-20%
        )
        segs = list(segments)
        pass1_time = time.time() - pass1_start
        
        if segs and len(segs) > 0:
            logger.info(
                f"Pass 1 success",
                extra={'extra_data': {
                    'pass': 1,
                    'segments_count': len(segs),
                    'duration_seconds': round(pass1_time, 2),
                    'detected_language': info.language
                }}
            )
            return _add_confidence_scores(segs), info
        else:
            logger.warning(
                "Pass 1 returned no segments",
                extra={'extra_data': {
                    'pass': 1,
                    'duration_seconds': round(pass1_time, 2),
                    'reason': 'empty_segments'
                }}
            )
    except Exception as e:
        pass1_time = time.time() - pass1_start
        log_error_with_context(logger, e, {
            'pass': 1,
            'duration_seconds': round(pass1_time, 2),
            'wav_path': wav_path
        })
    
    # Pass 2: Relaxed VAD (only if Pass 1 fails or returns no segments)
    pass2_start = time.time()
    try:
        logger.debug("Pass 2: Starting transcription with relaxed VAD")
        segments, info = model.transcribe(
            wav_path, language=language,
            vad_filter=True, vad_parameters=dict(min_silence_duration_ms=max(120, VAD_MIN_SIL_MS // 2), speech_pad_ms=220),
            beam_size=BEAM_SIZE, best_of=BEST_OF, temperature=temps,
            condition_on_previous_text=True, initial_prompt=prompt,
            compression_ratio_threshold=2.5, log_prob_threshold=-1.2, no_speech_threshold=0.12,
            word_timestamps=False,  # SPEED: Tắt word timestamps
        )
        segs = list(segments)
        pass2_time = time.time() - pass2_start
        
        if segs and len(segs) > 0:
            logger.info(
                f"Pass 2 success",
                extra={'extra_data': {
                    'pass': 2,
                    'segments_count': len(segs),
                    'duration_seconds': round(pass2_time, 2),
                    'detected_language': info.language
                }}
            )
            return _add_confidence_scores(segs), info
        else:
            logger.warning(
                "Pass 2 returned no segments",
                extra={'extra_data': {
                    'pass': 2,
                    'duration_seconds': round(pass2_time, 2),
                    'reason': 'empty_segments'
                }}
            )
    except Exception as e:
        pass2_time = time.time() - pass2_start
        log_error_with_context(logger, e, {
            'pass': 2,
            'duration_seconds': round(pass2_time, 2),
            'wav_path': wav_path
        })
    
    # SPEED: Bỏ Pass 3 (no VAD) - hiếm khi cần thiết và rất chậm
    # Nếu cần, người dùng có thể thử lại với audio chất lượng tốt hơn
    logger.error(
        "All transcription passes failed",
        extra={'extra_data': {
            'wav_path': wav_path,
            'passes_attempted': 2,
            'suggestion': 'Check audio quality or try different source'
        }}
    )
    raise HTTPException(422, "Không thể nhận diện được tiếng nói từ audio. Vui lòng kiểm tra chất lượng audio.")

def _add_confidence_scores(segments) -> List[Dict[str, Any]]:
    enriched = []
    for seg in segments:
        seg_dict = {
            "start": seg.start,
            "end": seg.end,
            "text": seg.text.strip(),
            "avg_logprob": seg.avg_logprob,
            "no_speech_prob": seg.no_speech_prob,
            "confidence": _calculate_confidence(seg),
        }
        if hasattr(seg, 'words') and seg.words:
            seg_dict["words"] = [
                {"word": w.word, "start": w.start, "end": w.end, "probability": w.probability} 
                for w in seg.words
            ]
        enriched.append(seg_dict)
    return enriched

def _calculate_confidence(seg) -> float:
    logprob_score = max(0, min(1, 1 + seg.avg_logprob))
    speech_score = 1 - seg.no_speech_prob
    compression_ratio = getattr(seg, 'compression_ratio', 1.0)
    compression_score = 1.0 if compression_ratio < 2.4 else max(0, 1 - (compression_ratio - 2.4) / 2)
    confidence = 0.5 * logprob_score + 0.3 * speech_score + 0.2 * compression_score
    return round(confidence, 3)

def transcribe_with_retries(model, wav_path: str, language: str) -> Tuple[List, dict]:
    """Legacy compatibility"""
    segments, info = transcribe_with_confidence(model, wav_path, language)
    return segments, info
