from fastapi import APIRouter, UploadFile, File, Query
from pathlib import Path
import tempfile, os
from ..core.audio import extract_wav, audio_metrics_from_wav, auto_select_best_channel
from ..core.config import USE_DENOISE

router = APIRouter(prefix="/api", tags=["Health"])

@router.post("/analyze", summary="Phân tích cơ bản (đồng bộ với /api/gensub)")
async def analyze(
    file: UploadFile = File(..., description="Video/Audio để phân tích"),
    denoise: int | None = Query(None, ge=0, le=1, description="0/1: tắt/bật lọc (mặc định theo USE_DENOISE)"),
    channel: str | None = Query("auto", pattern="^(auto|mix|left|right)$", description="Kênh để downmix"),
):
    with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename or ".mp4").suffix) as tmp:
        src_path = Path(tmp.name)
        tmp.write(await file.read())

    try:
        with tempfile.TemporaryDirectory() as td:
            wav_path = Path(td) / "audio.wav"
            use_denoise = (denoise == 1) if denoise is not None else USE_DENOISE
            extract_wav(src_path, wav_path, denoise=use_denoise, channel=channel or "auto")
            metrics = audio_metrics_from_wav(wav_path)
            suggest_channel = channel or "auto"

            # Auto-select best channel if needed
            if channel == "auto" or channel == "mix":
                best_wav, best_metrics, selected_channel = auto_select_best_channel(
                    src_path, metrics, td, use_denoise
                )
                if best_wav is not None:
                    metrics = best_metrics
                    suggest_channel = selected_channel
                else:
                    suggest_channel = selected_channel

            return {
                "filename": file.filename,
                "duration_sec": metrics["duration_sec"],
                "rms_dbfs": metrics["rms_dbfs"],
                "peak_dbfs": metrics["peak_dbfs"],
                "silence_ratio": metrics["silence_ratio"],
                "dynamic_range_db": metrics["dynamic_range_db"],
                "suggest_denoise": metrics["suggest_denoise"],
                "suggest_channel": suggest_channel,
            }
    finally:
        try: os.unlink(src_path)
        except Exception: pass
