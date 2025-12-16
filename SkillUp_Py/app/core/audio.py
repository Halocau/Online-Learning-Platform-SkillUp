import subprocess, re
from pathlib import Path
from functools import lru_cache
from typing import Optional
from collections import OrderedDict

# Pre-compile regex patterns for better performance
_RMS_PATTERN = re.compile(r"Overall RMS level:\s*([-+]?\d+\.?\d*)")
_PEAK_PATTERN = re.compile(r"Overall peak level:\s*([-+]?\d+\.?\d*)")
_SILENCE_DUR_PATTERN = re.compile(r"silence_duration:\s*([\d\.]+)")
_CHANNEL_FL_RMS = re.compile(r"Channel: FL.*?RMS level:\s*([-+]?\d+\.?\d*)", re.S)
_CHANNEL_FR_RMS = re.compile(r"Channel: FR.*?RMS level:\s*([-+]?\d+\.?\d*)", re.S)

# LRU cache for duration to avoid repeated ffprobe calls and memory leaks
try:
    from .config import DURATION_CACHE_MAX_SIZE
except ImportError:
    DURATION_CACHE_MAX_SIZE = 1000

class LRUCache:
    """Simple LRU cache implementation"""
    def __init__(self, max_size: int = 1000):
        self.max_size = max_size
        self.cache: OrderedDict = OrderedDict()
    
    def get(self, key: str) -> Optional[float]:
        if key in self.cache:
            # Move to end (most recently used)
            self.cache.move_to_end(key)
            return self.cache[key]
        return None
    
    def set(self, key: str, value: float):
        if key in self.cache:
            # Update existing
            self.cache.move_to_end(key)
        else:
            # Add new
            if len(self.cache) >= self.max_size:
                # Remove oldest (first item)
                self.cache.popitem(last=False)
        self.cache[key] = value
    
    def clear(self):
        self.cache.clear()

_duration_cache = LRUCache(max_size=DURATION_CACHE_MAX_SIZE)

def ffprobe_duration(path: Path, use_cache: bool = True) -> float:
    """Get video/audio duration with LRU caching"""
    path_str = str(path)
    if use_cache:
        cached = _duration_cache.get(path_str)
        if cached is not None:
            return cached
    
    cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration",
           "-of", "default=noprint_wrappers=1:nokey=1", path_str]
    p = subprocess.run(cmd, capture_output=True, timeout=10)
    out = (p.stdout or b"").decode("utf-8", errors="ignore").strip()
    try:
        duration = float(out)
        if use_cache:
            _duration_cache.set(path_str, duration)
        return duration
    except:
        return 0.0

def ffmpeg_astats(path: Path) -> dict:
    """Get audio statistics (optimized with pre-compiled regex)"""
    cmd = ["ffmpeg", "-hide_banner", "-i", str(path),
           "-filter_complex", "astats=metadata=1:reset=1", "-f", "null", "-"]
    p = subprocess.run(cmd, capture_output=True, timeout=30)
    txt = (p.stderr or b"").decode("utf-8", errors="ignore")
    m_rms  = _RMS_PATTERN.findall(txt)
    m_peak = _PEAK_PATTERN.findall(txt)
    
    def _avg(vals, default):
        if not vals: return default
        nums = [float(v) for v in vals]
        return sum(nums)/len(nums)
    
    return {"rms_dbfs": _avg(m_rms, -35.0), "peak_dbfs": _avg(m_peak, -3.0)}

def ffmpeg_silence_ratio(path: Path, noise_db: Optional[str] = None, min_len: Optional[str] = None, duration: Optional[float] = None) -> float:
    """Get silence ratio (optimized with pre-compiled regex and optional duration cache)"""
    try:
        from .config import AUDIO_SILENCE_THRESHOLD_DB, AUDIO_SILENCE_MIN_LENGTH
    except ImportError:
        AUDIO_SILENCE_THRESHOLD_DB = "-30dB"
        AUDIO_SILENCE_MIN_LENGTH = "0.3"
    
    if noise_db is None:
        noise_db = AUDIO_SILENCE_THRESHOLD_DB
    if min_len is None:
        min_len = AUDIO_SILENCE_MIN_LENGTH
    
    cmd = ["ffmpeg", "-hide_banner", "-i", str(path),
           "-af", f"silencedetect=noise={noise_db}:d={min_len}", "-f", "null", "-"]
    p = subprocess.run(cmd, capture_output=True, timeout=30)
    txt = (p.stderr or b"").decode("utf-8", errors="ignore")
    durs = _SILENCE_DUR_PATTERN.findall(txt)
    total_sil = sum(float(x) for x in durs) if durs else 0.0
    
    # Use provided duration or fetch it
    total = duration if duration is not None else ffprobe_duration(path, use_cache=True)
    if total <= 0: return 0.0
    return max(0.0, min(1.0, total_sil / total))

def audio_metrics_from_wav(wav_path: Path) -> dict:
    """Get comprehensive audio metrics (optimized - cache duration)"""
    # Get duration first and cache it
    duration = ffprobe_duration(wav_path, use_cache=True)
    
    # Get stats and silence ratio (pass duration to avoid re-fetching)
    ast = ffmpeg_astats(wav_path)
    sil = ffmpeg_silence_ratio(wav_path, noise_db="-30dB", min_len="0.3", duration=duration)
    
    rms = ast["rms_dbfs"]
    peak = ast["peak_dbfs"]
    suggest_denoise = (rms < -28.0) or (sil < 0.10) or ((peak - rms) > 20.0)
    
    return {
        "duration_sec": round(duration, 3),
        "rms_dbfs": round(rms, 2),
        "peak_dbfs": round(peak, 2),
        "silence_ratio": round(sil, 3),
        "dynamic_range_db": round(peak - rms, 2),
        "suggest_denoise": bool(suggest_denoise),
    }

def choose_channel(src_path: Path) -> str:
    """Return 'mix' | 'left' | 'right' (kênh nào RMS tốt hơn rõ rệt) - optimized"""
    try:
        from .config import AUDIO_CHANNEL_RMS_DIFF_THRESHOLD
    except ImportError:
        AUDIO_CHANNEL_RMS_DIFF_THRESHOLD = 1.0
    
    try:
        cmd = ["ffmpeg", "-hide_banner", "-i", str(src_path),
               "-filter_complex", "astats=metadata=1:reset=1", "-f", "null", "-"]
        p = subprocess.run(cmd, capture_output=True, timeout=10)
        txt = (p.stderr or b"").decode("utf-8", errors="ignore")
        
        # Use pre-compiled regex
        l = [float(x) for x in _CHANNEL_FL_RMS.findall(txt)]
        r = [float(x) for x in _CHANNEL_FR_RMS.findall(txt)]
        
        l_val = min(l) if l else -99.0
        r_val = min(r) if r else -99.0
        
        if l_val > r_val + AUDIO_CHANNEL_RMS_DIFF_THRESHOLD: return "left"
        if r_val > l_val + AUDIO_CHANNEL_RMS_DIFF_THRESHOLD: return "right"
        return "mix"
    except Exception:
        return "mix"

def auto_select_best_channel(
    video_path: Path,
    metrics: dict,
    temp_dir: Path | str,
    use_denoise: bool
) -> tuple[Optional[Path], dict, str]:
    """
    Tự động chọn channel tốt nhất (left/right/mix) dựa trên audio quality.
    
    Returns:
        (best_wav_path, best_metrics, selected_channel)
    """
    try:
        from .config import (
            AUDIO_POOR_QUALITY_SILENCE_RATIO,
            AUDIO_POOR_QUALITY_RMS_DBFS,
            AUDIO_CHANNEL_RMS_DIFF_THRESHOLD
        )
    except ImportError:
        AUDIO_POOR_QUALITY_SILENCE_RATIO = 0.08
        AUDIO_POOR_QUALITY_RMS_DBFS = -25.0
        AUDIO_CHANNEL_RMS_DIFF_THRESHOLD = 1.0
    
    # Convert temp_dir to Path if it's a string
    if isinstance(temp_dir, str):
        temp_dir = Path(temp_dir)
    
    # Chỉ test channels nếu audio thực sự kém chất lượng
    if metrics["silence_ratio"] >= AUDIO_POOR_QUALITY_SILENCE_RATIO or metrics["rms_dbfs"] >= AUDIO_POOR_QUALITY_RMS_DBFS:
        # Audio đủ tốt, không cần test channels
        return None, metrics, "mix"
    
    # Test left và right channels
    left_wav = temp_dir / "audio_left.wav"
    right_wav = temp_dir / "audio_right.wav"
    
    extract_wav(video_path, left_wav, denoise=use_denoise, channel="left")
    extract_wav(video_path, right_wav, denoise=use_denoise, channel="right")
    
    m_left = audio_metrics_from_wav(left_wav)
    m_right = audio_metrics_from_wav(right_wav)
    
    # Chọn channel tốt nhất
    if (m_left["rms_dbfs"] > m_right["rms_dbfs"] + AUDIO_CHANNEL_RMS_DIFF_THRESHOLD and 
        m_left["silence_ratio"] >= m_right["silence_ratio"]):
        return left_wav, m_left, "left"
    elif (m_right["rms_dbfs"] > m_left["rms_dbfs"] + AUDIO_CHANNEL_RMS_DIFF_THRESHOLD and 
          m_right["silence_ratio"] >= m_left["silence_ratio"]):
        return right_wav, m_right, "right"
    else:
        return None, metrics, "mix"

def extract_wav(src_path: Path, wav_out: Path, denoise: bool, channel: str = "auto"):
    """
    Chuẩn hoá audio → 16kHz mono.
    channel: 'auto' | 'mix' | 'left' | 'right'
    denoise: lọc ồn/nhạc nền + loudnorm.
    """
    if channel == "auto":
        channel = choose_channel(src_path)

    pan = None
    if channel == "left":  pan = "pan=mono|c0=FL"
    if channel == "right": pan = "pan=mono|c0=FR"

    denoise_chain = "highpass=f=100,lowpass=f=7500,afftdn=nf=-22,loudnorm=I=-18:TP=-1.5:LRA=11" if denoise else None
    if pan and denoise_chain: af = f"{pan},{denoise_chain}"
    elif pan:                 af = pan
    else:                     af = denoise_chain

    if af:
        cmd = ["ffmpeg", "-y", "-i", str(src_path), "-af", af, "-ac", "1", "-ar", "16000", "-vn", str(wav_out)]
    else:
        cmd = ["ffmpeg", "-y", "-i", str(src_path), "-ac", "1", "-ar", "16000", "-vn", str(wav_out)]
    
    # Add timeout to prevent hanging
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=300)
