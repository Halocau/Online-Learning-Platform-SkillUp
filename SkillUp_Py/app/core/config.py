from pathlib import Path
import os
from .env_loader import get_env

# Load .env file
from .env_loader import load_dotenv
load_dotenv()

# gốc project = thư mục chứa thư mục 'app'
PROJECT_ROOT = Path(__file__).resolve().parents[2]
UPLOAD_DIR = PROJECT_ROOT / "upload"       # ✅ lưu trong project
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Remote video download settings
REMOTE_DOWNLOAD_TIMEOUT = float(get_env("REMOTE_DOWNLOAD_TIMEOUT", "120"))
MAX_REMOTE_FILE_MB = int(get_env("MAX_REMOTE_FILE_MB", get_env("MAX_FILE_MB", "2048")))
ALLOWED_REMOTE_VIDEO_HOSTS = [
    host.strip() for host in get_env("ALLOWED_REMOTE_VIDEO_HOSTS", "").split(",") if host.strip()
]

# ENV / defaults
WHISPER_MODEL  = get_env("WHISPER_MODEL", "small")
DEVICE         = get_env("DEVICE", "cpu")         # "cpu" | "cuda" | "auto"
COMPUTE_TYPE   = get_env("COMPUTE_TYPE", "int8")  # CPU:int8 | GPU:float16
USE_DENOISE    = get_env("USE_DENOISE", "1") == "1"
VAD_MIN_SIL_MS = int(get_env("VAD_MIN_SIL_MS", "300"))
# Tăng mặc định để tăng độ chính xác (có thể giảm trong .env nếu cần nhanh hơn)
BEAM_SIZE      = int(get_env("BEAM_SIZE", "7"))  # Tăng từ 5 → 7 để tăng độ chính xác
BEST_OF        = int(get_env("BEST_OF", "7"))    # Tăng từ 5 → 7 để tăng độ chính xác
TEMPERATURE    = float(get_env("TEMPERATURE", "0.0"))
# Normalize language code to 2-letter format (e.g., "en_US:" -> "en", "vi" -> "vi")
_language_raw = get_env("LANGUAGE", "vi")
LANGUAGE = _language_raw.split(":")[0].split("_")[0].lower() if _language_raw else "vi"
MAX_FILE_MB    = int(get_env("MAX_FILE_MB", "2048"))
# Prompt mặc định (sẽ được override bởi get_optimized_prompt trong vietnamese.py)
INITIAL_PROMPT = get_env(
    "INITIAL_PROMPT",
    "Đây là nội dung tiếng Việt. Sử dụng dấu câu đúng, viết hoa đầu câu. "
    "Ví dụ: 'Xin chào. Bạn khỏe không?'"
)

# AI Correction settings
AI_CORRECTION_ENABLED = get_env("AI_CORRECTION_ENABLED", "1") == "1"  # Enable/disable AI correction globally
AI_CORRECTION_MAX_CONCURRENT = int(get_env("AI_CORRECTION_MAX_CONCURRENT", "3"))  # Max concurrent Gemini requests
AI_CORRECTION_RATE_LIMIT = int(get_env("AI_CORRECTION_RATE_LIMIT", "10"))  # Max requests per minute per key (free tier: 10)
AI_CORRECTION_BATCH_SIZE = int(get_env("AI_CORRECTION_BATCH_SIZE", "15"))  # Batch size for correction (tăng để giảm số requests)

# Parallel Processing settings
PARALLEL_PROCESSING_ENABLED = get_env("PARALLEL_PROCESSING_ENABLED", "1") == "1"  # Enable/disable parallel chunk processing
PARALLEL_CHUNK_DURATION = float(get_env("PARALLEL_CHUNK_DURATION", "60.0"))  # Mỗi chunk dài bao nhiêu giây (mặc định 60s = 1 phút)
PARALLEL_MIN_DURATION = float(get_env("PARALLEL_MIN_DURATION", "120.0"))  # Chỉ chia chunk nếu video >= 120s (2 phút)
PARALLEL_MAX_WORKERS = int(get_env("PARALLEL_MAX_WORKERS", "4"))  # Số worker threads tối đa

# Audio processing constants
AUDIO_CHUNK_SIZE_MB = int(get_env("AUDIO_CHUNK_SIZE_MB", "1"))  # Chunk size for file upload (MB)
AUDIO_SILENCE_THRESHOLD_DB = get_env("AUDIO_SILENCE_THRESHOLD_DB", "-30dB")  # Silence detection threshold
AUDIO_SILENCE_MIN_LENGTH = get_env("AUDIO_SILENCE_MIN_LENGTH", "0.3")  # Minimum silence length (seconds)
AUDIO_POOR_QUALITY_SILENCE_RATIO = float(get_env("AUDIO_POOR_QUALITY_SILENCE_RATIO", "0.08"))  # Threshold for poor audio quality
AUDIO_POOR_QUALITY_RMS_DBFS = float(get_env("AUDIO_POOR_QUALITY_RMS_DBFS", "-25.0"))  # RMS threshold for poor audio
AUDIO_CHANNEL_RMS_DIFF_THRESHOLD = float(get_env("AUDIO_CHANNEL_RMS_DIFF_THRESHOLD", "1.0"))  # Min RMS difference to prefer one channel

# Duration cache settings
DURATION_CACHE_MAX_SIZE = int(get_env("DURATION_CACHE_MAX_SIZE", "1000"))  # Max entries in duration cache

# Subtitle processing constants
SUBTITLE_MERGE_MAX_GAP = float(get_env("SUBTITLE_MERGE_MAX_GAP", "0.5"))  # Max gap between segments to merge (seconds)
SUBTITLE_MERGE_MIN_DUR = float(get_env("SUBTITLE_MERGE_MIN_DUR", "1.5"))  # Min duration for merged segment (seconds)
SUBTITLE_CONFIDENCE_THRESHOLD = float(get_env("SUBTITLE_CONFIDENCE_THRESHOLD", "0.3"))  # Min confidence to keep segment
SUBTITLE_SPLIT_MAX_DUR = float(get_env("SUBTITLE_SPLIT_MAX_DUR", "8.0"))  # Max duration before splitting (seconds)
SUBTITLE_SPLIT_MAX_CHARS = int(get_env("SUBTITLE_SPLIT_MAX_CHARS", "150"))  # Max characters before splitting
SUBTITLE_PRE_AI_MERGE_THRESHOLD = int(get_env("SUBTITLE_PRE_AI_MERGE_THRESHOLD", "20"))  # Min segments to trigger pre-AI merge
SUBTITLE_PRE_AI_MERGE_MAX_GAP = float(get_env("SUBTITLE_PRE_AI_MERGE_MAX_GAP", "1.0"))  # Max gap for pre-AI merge
SUBTITLE_PRE_AI_MERGE_MIN_DUR = float(get_env("SUBTITLE_PRE_AI_MERGE_MIN_DUR", "2.0"))  # Min duration for pre-AI merge

# Multi-key support: Parse multiple API keys
# Format: GEMINI_API_KEY=key1,key2,key3 hoặc GEMINI_API_KEY_1, GEMINI_API_KEY_2, ...
def get_gemini_api_keys() -> list[str]:
    """Get all Gemini API keys from environment"""
    keys = []
    
    # Method 2: GEMINI_API_KEY_1, GEMINI_API_KEY_2, ... (ưu tiên cách này)
    i = 1
    while True:
        key = get_env(f"GEMINI_API_KEY_{i}", "")
        if not key:
            break
        if key.strip() and key.strip() not in keys:
            keys.append(key.strip())
        i += 1
        if i > 20:  # Safety limit
            break
    
    # Method 1: Comma-separated in GEMINI_API_KEY (chỉ dùng nếu không có GEMINI_API_KEY_1)
    if not keys:  # Chỉ dùng cách 1 nếu cách 2 không có key nào
        single_key = get_env("GEMINI_API_KEY", "")
        if single_key:
            # Check if it's comma-separated
            if "," in single_key:
                keys.extend([k.strip() for k in single_key.split(",") if k.strip()])
            else:
                keys.append(single_key.strip())
    
    return keys

GEMINI_API_KEYS = get_gemini_api_keys()

