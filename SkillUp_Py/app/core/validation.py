"""
Security validation and file type checking
"""
from pathlib import Path
from typing import Tuple, Optional
from fastapi import HTTPException, UploadFile
from .logger import setup_logger

logger = setup_logger('validation')

# Try to import magic, fallback if not available
try:
    import magic
    HAS_MAGIC = True
    logger.info("python-magic available, using magic number validation")
except ImportError:
    HAS_MAGIC = False
    logger.warning("python-magic not available, using extension-based validation")

# Allowed MIME types for video/audio
ALLOWED_VIDEO_TYPES = {
    'video/mp4', 'video/x-matroska', 'video/quicktime', 'video/x-msvideo',
    'video/webm', 'video/mpeg', 'video/x-flv'
}

ALLOWED_AUDIO_TYPES = {
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave',
    'audio/aac', 'audio/flac', 'audio/ogg', 'audio/webm', 'audio/m4a',
    'audio/x-m4a', 'audio/mp4'
}

ALLOWED_TYPES = ALLOWED_VIDEO_TYPES | ALLOWED_AUDIO_TYPES

# Allowed extensions (fallback when magic is not available)
ALLOWED_EXTENSIONS = {
    '.mp4', '.mkv', '.mov', '.avi', '.webm', '.flv',  # video
    '.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg', '.wma'  # audio
}

def validate_file_type(file_path: Path) -> Tuple[bool, Optional[str]]:
    """
    Validate file type using magic numbers (preferred) or extension (fallback)
    Returns: (is_valid, mime_type)
    """
    if HAS_MAGIC:
        # Use magic number validation
        try:
            mime = magic.Magic(mime=True)
            detected_type = mime.from_file(str(file_path))
            
            if detected_type in ALLOWED_TYPES:
                return True, detected_type
            
            logger.warning(f"Invalid file type detected: {detected_type}")
            return False, detected_type
        except Exception as e:
            logger.error(f"Error in magic validation: {e}, falling back to extension check")
    
    # Fallback to extension-based validation
    ext = file_path.suffix.lower()
    if ext in ALLOWED_EXTENSIONS:
        logger.debug(f"Extension validation passed: {ext}")
        return True, f"unknown/{ext[1:]}"
    
    logger.warning(f"Invalid file extension: {ext}")
    return False, None

def validate_filename(filename: str) -> bool:
    """Check for path traversal and malicious filenames"""
    if not filename:
        return False
    
    # Check for path traversal
    if '..' in filename or '/' in filename or '\\' in filename:
        logger.warning(f"Path traversal attempt: {filename}")
        return False
    
    # Check for null bytes
    if '\x00' in filename:
        logger.warning(f"Null byte in filename: {filename}")
        return False
    
    return True

async def validate_upload_file(
    file: UploadFile,
    max_size_mb: int = 2048
) -> Tuple[bytes, int]:
    """
    Validate and read upload file with size limit
    Returns: (content, size_bytes)
    """
    if not validate_filename(file.filename or ''):
        raise HTTPException(400, "Invalid filename")
    
    # Read with size limit
    max_bytes = max_size_mb * 1024 * 1024
    content = await file.read()
    size = len(content)
    
    if size > max_bytes:
        raise HTTPException(413, f"File too large (>{max_size_mb}MB). Got {size / 1024 / 1024:.1f}MB")
    
    if size == 0:
        raise HTTPException(400, "Empty file")
    
    logger.info(f"File validated: {file.filename}, size={size / 1024 / 1024:.2f}MB")
    return content, size
