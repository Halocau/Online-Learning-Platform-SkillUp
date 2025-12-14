from pathlib import Path
from urllib.parse import urlparse

import httpx
from fastapi import HTTPException

from .config import (
    ALLOWED_REMOTE_VIDEO_HOSTS,
    MAX_REMOTE_FILE_MB,
    REMOTE_DOWNLOAD_TIMEOUT,
)


def _cleanup_path(path: Path) -> None:
    try:
        if path.exists():
            path.unlink()
    except Exception:
        pass


def download_remote_video(
    video_url: str,
    dest_path: Path,
    max_file_mb: int | None = None,
    timeout: float | None = None,
) -> int:
    """
    Download a remote video to dest_path with size & host validation.

    Returns total bytes downloaded. Raises HTTPException on failure.
    """
    parsed = urlparse(video_url or "")
    if parsed.scheme not in {"http", "https"}:
        raise HTTPException(400, "Chỉ hỗ trợ URL HTTP/HTTPS")
    if not parsed.netloc:
        raise HTTPException(400, "URL không hợp lệ")

    host = parsed.hostname or ""
    if ALLOWED_REMOTE_VIDEO_HOSTS and host not in ALLOWED_REMOTE_VIDEO_HOSTS:
        raise HTTPException(400, f"Host '{host}' không được phép tải video")

    max_bytes = (max_file_mb or MAX_REMOTE_FILE_MB) * 1024 * 1024
    timeout = timeout or REMOTE_DOWNLOAD_TIMEOUT

    dest_path.parent.mkdir(parents=True, exist_ok=True)
    downloaded = 0

    try:
        with httpx.Client(timeout=timeout, follow_redirects=False) as client:
            content_length = None
            try:
                head_resp = client.head(video_url)
                if head_resp.status_code < 400:
                    content_length = head_resp.headers.get("Content-Length")
                    if content_length:
                        cl = int(content_length)
                        if cl > max_bytes:
                            raise HTTPException(
                                413,
                                f"Kích thước file ({round(cl/1024/1024,2)} MB) vượt giới hạn",
                            )
                elif head_resp.status_code in {405, 403}:
                    pass
                else:
                    head_resp.raise_for_status()
            except (httpx.HTTPError, ValueError):
                content_length = None

            with client.stream("GET", video_url) as response:
                response.raise_for_status()
                if content_length is None:
                    cl = response.headers.get("Content-Length")
                    if cl:
                        try:
                            content_length = int(cl)
                            if content_length > max_bytes:
                                raise HTTPException(
                                    413,
                                    f"Kích thước file ({round(content_length/1024/1024,2)} MB) vượt giới hạn",
                                )
                        except ValueError:
                            content_length = None

                with open(dest_path, "wb") as f:
                    for chunk in response.iter_bytes(chunk_size=1024 * 1024):
                        if not chunk:
                            continue
                        downloaded += len(chunk)
                        if downloaded > max_bytes:
                            raise HTTPException(
                                413,
                                f"Kích thước file vượt giới hạn {max_file_mb or MAX_REMOTE_FILE_MB} MB",
                            )
                        f.write(chunk)

        # Ensure we always return an int
        if downloaded > 0:
            return downloaded
        if content_length is not None:
            try:
                return int(content_length)
            except (ValueError, TypeError):
                return 0
        return 0

    except HTTPException:
        _cleanup_path(dest_path)
        raise
    except httpx.HTTPStatusError as exc:
        _cleanup_path(dest_path)
        status = exc.response.status_code
        raise HTTPException(status, f"Không thể tải video (HTTP {status})")
    except httpx.HTTPError as exc:
        _cleanup_path(dest_path)
        raise HTTPException(400, f"Lỗi kết nối tới video URL: {exc}")
    except Exception as exc:
        _cleanup_path(dest_path)
        raise HTTPException(500, f"Lỗi tải video: {exc}")

