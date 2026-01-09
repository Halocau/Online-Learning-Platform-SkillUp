"""
Xử lý audio cho gensub (tối ưu CPU, sẵn sàng production)
Optimized for: VPS, CPU-only, speed + simplicity + stability
"""
import subprocess
from pathlib import Path
from functools import lru_cache


@lru_cache(maxsize=128)
def ffprobe_duration(path_str: str) -> float:
    """
    Lấy thời lượng video/audio tính bằng giây (có cache).
    
    Args:
        path_str: Đường dẫn file dạng string (bắt buộc để LRU cache hash được)
    
    Returns:
        Thời lượng tính bằng giây, hoặc 0.0 nếu không xác định được
    
    Note:
        - Dùng @lru_cache của Python (đơn giản hơn custom LRUCache class)
        - Cache 128 entries (đủ cho parallel processing)
        - Path phải là string vì Path object không hashable
    """
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        path_str
    ]
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=10
        )
        return float(result.stdout.strip())
    except (ValueError, subprocess.TimeoutExpired, subprocess.CalledProcessError):
        return 0.0


def extract_wav(
    src_path: Path,
    wav_out: Path,
    denoise: bool = False,
    channel: str = "mix",
) -> None:
    """
    Trích xuất audio tối ưu cho Whisper/faster-whisper.
    
    Chuẩn hóa:
    - Mono (1 kênh)
    - Tần số mẫu 16kHz (tối ưu cho Whisper)
    - Không có video stream
    - Giảm nhiễu tùy chọn (TẮT mặc định để nhanh hơn)
    
    Args:
        src_path: File video/audio đầu vào
        wav_out: Đường dẫn file WAV đầu ra
        denoise: Bật lọc nhiễu (chậm hơn ~30%, chỉ dùng cho audio kém chất lượng)
        channel: "mix" (mặc định), "left" (kênh trái), "right" (kênh phải)
    
    Raises:
        subprocess.CalledProcessError: Nếu FFmpeg thất bại
        subprocess.TimeoutExpired: Nếu quá 5 phút
    """
    af_filters = []
    
    # Chọn kênh (hữu ích khi lời thoại chỉ ở 1 kênh)
    if channel == "left":
        af_filters.append("pan=mono|c0=FL")
    elif channel == "right":
        af_filters.append("pan=mono|c0=FR")
    
    # Chuỗi denoise tùy chọn (tốn thêm ~30% thời gian xử lý)
    if denoise:
        af_filters.extend([
            "highpass=f=100",      # Bỏ tần số thấp (rumble)
            "lowpass=f=7500",      # Bỏ tần số cao (hiss)
            "afftdn=nf=-22",       # Giảm nhiễu FFT
            "loudnorm=I=-18:TP=-1.5:LRA=11"  # Chuẩn hóa âm lượng
        ])
    
    cmd = [
        "ffmpeg",
        "-threads", "1",  # Single thread để tránh CPU over-subscription trên VPS
        "-y",             # Ghi đè output
        "-i", str(src_path),
        "-ac", "1",       # Mono
        "-ar", "16000",   # 16kHz (tối ưu cho Whisper)
        "-vn",            # Không có video
    ]
    
    if af_filters:
        cmd.extend(["-af", ",".join(af_filters)])
    
    cmd.append(str(wav_out))
    
    subprocess.run(
        cmd,
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        timeout=300  # Tối đa 5 phút
    )
