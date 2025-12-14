"""
Model cache manager to avoid reloading models
"""
from typing import Dict, Optional
from faster_whisper import WhisperModel
from threading import Lock
from .logger import setup_logger

logger = setup_logger('model_cache')

class ModelCache:
    """Thread-safe model cache"""
    def __init__(self):
        self._cache: Dict[str, WhisperModel] = {}
        self._lock = Lock()
    
    def get_model(
        self, 
        model_name: str, 
        device: str = "cpu", 
        compute_type: str = "int8"
    ) -> WhisperModel:
        """Get or load model from cache"""
        cache_key = f"{model_name}_{device}_{compute_type}"
        
        with self._lock:
            if cache_key not in self._cache:
                logger.info(f"Loading model: {cache_key}")
                self._cache[cache_key] = WhisperModel(
                    model_name, 
                    device=device, 
                    compute_type=compute_type
                )
                logger.info(f"Model loaded: {cache_key}")
            else:
                logger.debug(f"Model cache hit: {cache_key}")
            
            return self._cache[cache_key]
    
    def clear_cache(self):
        """Clear all cached models"""
        with self._lock:
            self._cache.clear()
            logger.info("Model cache cleared")

# Global instance
model_cache = ModelCache()
