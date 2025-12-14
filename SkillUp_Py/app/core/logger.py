"""
Logging system with structured logs for monitoring and debugging
"""
import logging
import sys
from pathlib import Path
from datetime import datetime
import json

# Create logs directory
LOG_DIR = Path(__file__).resolve().parents[2] / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

class StructuredFormatter(logging.Formatter):
    """JSON formatter for structured logging"""
    def format(self, record):
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        
        # Add extra fields
        if hasattr(record, 'extra_data'):
            log_data.update(record.extra_data)
            
        return json.dumps(log_data, ensure_ascii=False)

def setup_logger(name: str, level=logging.INFO):
    """Setup logger with file and console handlers"""
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Avoid duplicate handlers
    if logger.handlers:
        return logger
    
    # Console handler (human-readable)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(console_format)
    logger.addHandler(console_handler)
    
    # File handler (JSON structured)
    file_handler = logging.FileHandler(
        LOG_DIR / f"gensub_{datetime.now().strftime('%Y%m%d')}.log",
        encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(StructuredFormatter())
    logger.addHandler(file_handler)
    
    return logger

def log_with_context(logger, level, message, **kwargs):
    """Log with additional context data"""
    extra_data = kwargs
    logger.log(level, message, extra={'extra_data': extra_data})

def log_performance(logger, operation: str, duration: float, **kwargs):
    """Log performance metrics"""
    logger.info(
        f"Performance: {operation} took {duration:.2f}s",
        extra={'extra_data': {'operation': operation, 'duration_seconds': duration, **kwargs}}
    )

def log_error_with_context(logger, error: Exception, context: dict = None):
    """Log error with full context"""
    error_info = {
        'error_type': type(error).__name__,
        'error_message': str(error),
        'context': context or {}
    }
    logger.error(
        f"Error: {error_info['error_type']} - {error_info['error_message']}",
        exc_info=True,
        extra={'extra_data': error_info}
    )

# Default logger
default_logger = setup_logger('gensub')
