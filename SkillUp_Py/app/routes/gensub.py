from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
import tempfile
import os
import time
import asyncio
from urllib.parse import urlparse

from faster_whisper import WhisperModel

from ..core.config import (
    UPLOAD_DIR,
    SUBTITLE_MERGE_MAX_GAP,
    SUBTITLE_MERGE_MIN_DUR,
    SUBTITLE_SPLIT_MAX_DUR,
    SUBTITLE_SPLIT_MAX_CHARS,
)
from ..core.logger import setup_logger
from ..core.downloader import download_remote_video
from ..core.audio import extract_wav
from ..core.subtitle import (
    merge_segments,
    split_long_segments,
    post_cleanup_caps,
    merge_all_segments,
    write_vtt,
    write_srt,
    write_text,
)
from ..core.utils import secure_stem
from ..core.validation import validate_file_type

logger = setup_logger("gensub")
router = APIRouter(prefix="/api", tags=["GenSub"])


# SPEED OPTIMIZED: Dùng 50-75% CPU để tránh over-subscription trên VPS
MODEL = WhisperModel(
    "small",
    device="cpu",
    compute_type="int8",
    cpu_threads=max(1, os.cpu_count() * 3 // 4),  # 75% CPU (an toàn cho VPS shared)
)


def transcribe_audio(wav_path: Path):
    """Transcribe audio - SPEED OPTIMIZED"""
    segments, _ = MODEL.transcribe(
        str(wav_path),
        language="vi",
        beam_size=1,        # Fast mode (đủ tốt cho hầu hết trường hợp)
        temperature=0.0,     # Deterministic
        vad_filter=True,     # Bỏ phần câm
        word_timestamps=False,  # Tắt word timestamps để nhanh hơn ~15-20%
    )

    return [
        {
            "start": s.start,
            "end": s.end,
            "text": s.text.strip(),
        }
        for s in segments
        if s.text.strip()
    ]


def process_video_sync(video_path: Path, fmt: str):
    with tempfile.TemporaryDirectory() as tmp:
        wav_path = Path(tmp) / "audio.wav"

        # 1. Extract audio (ONCE)
        extract_wav(video_path, wav_path, denoise=False, channel="mix")

        # 2. ASR
        segments = transcribe_audio(wav_path)
        if not segments:
            raise HTTPException(422, "Không nhận diện được thoại")

        # 3. Subtitle post-process (LIGHTWEIGHT)
        segments = merge_segments(
            segments,
            max_gap=SUBTITLE_MERGE_MAX_GAP,
            min_dur=SUBTITLE_MERGE_MIN_DUR,
        )
        segments = split_long_segments(
            segments,
            max_dur=SUBTITLE_SPLIT_MAX_DUR,
            max_chars=SUBTITLE_SPLIT_MAX_CHARS,
        )
        segments = post_cleanup_caps(segments)

        # 4. Write output
        ext = "txt" if fmt == "text" else fmt
        sub_path = video_path.with_suffix(f".{ext}")

        if fmt == "vtt":
            write_vtt(segments, sub_path)
            media_type = "text/vtt"
        elif fmt == "srt":
            write_srt(segments, sub_path)
            media_type = "application/x-subrip"
        else:
            write_text(merge_all_segments(segments), sub_path)
            media_type = "text/plain"

        return sub_path, media_type


@router.post("/gensub-url", summary="Generate subtitles from video URL (FAST CPU)")
async def gensub_url(
    video_url: str = Query(..., alias="videoUrl"),
    fmt: str = Query("text", pattern="^(vtt|srt|text)$"),
):
    start = time.time()

    raw_name = Path(urlparse(video_url).path).name or "video.mp4"
    stem = secure_stem(raw_name)
    uniq = int(time.time() * 1000)

    video_path = UPLOAD_DIR / f"{stem}_{uniq}.mp4"

    logger.info(f"[gensub] Downloading: {video_url}")

    # 1. Download
    download_remote_video(video_url, video_path)

    # 2. Validate
    ok, mime = validate_file_type(video_path)
    if not ok:
        video_path.unlink(missing_ok=True)
        raise HTTPException(400, f"Invalid file type: {mime}")

    # 3. Process in thread
    try:
        sub_path, media_type = await asyncio.to_thread(
            process_video_sync,
            video_path,
            fmt,
        )
    finally:
        video_path.unlink(missing_ok=True)

    logger.info(f"[gensub] Done in {round(time.time() - start, 2)}s")

    return FileResponse(
        sub_path,
        media_type=media_type,
        filename=sub_path.name,
    )
