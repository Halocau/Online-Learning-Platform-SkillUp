"""
AI-powered post-correction using Gemini API
Fixes spelling, grammar, and context errors in Vietnamese subtitles
"""
import os
import re
from typing import List, Dict, Optional
from .logger import setup_logger, log_error_with_context, log_performance
import time
import asyncio
import threading
from collections import defaultdict
from datetime import datetime, timedelta
from .env_loader import get_env
from .config import (
    AI_CORRECTION_ENABLED, AI_CORRECTION_MAX_CONCURRENT,
    AI_CORRECTION_RATE_LIMIT, AI_CORRECTION_BATCH_SIZE
)

logger = setup_logger('ai_correction')

# Try to import requests for REST API
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False
    logger.warning("requests not installed. AI correction disabled. (Thư viện requests chưa được cài đặt. AI correction đã tắt.)")

HAS_GEMINI = HAS_REQUESTS  # Chỉ cần requests để dùng REST API

from .config import get_gemini_api_keys

GEMINI_API_KEYS = get_gemini_api_keys()  # Support multiple keys
GEMINI_MODEL = get_env("GEMINI_MODEL", "gemini-2.5-flash")  # Default to latest model

# Global rate limiter và semaphore cho Gemini API
# Track rate limit per key
_gemini_rate_limiters = defaultdict(lambda: defaultdict(list))  # {key: {requests: [timestamps]}}
_gemini_quota_blocked = defaultdict(lambda: None)  # {key: blocked_until_timestamp} - Track keys blocked by 429
_gemini_semaphore = None  # Will be initialized as threading.Semaphore for sync code
_gemini_async_semaphore = None  # Will be initialized as asyncio.Semaphore for async code
_gemini_rate_lock = threading.Lock() if HAS_GEMINI else None
_gemini_key_index = 0  # Round-robin index
_gemini_key_lock = threading.Lock() if HAS_GEMINI else None

def _init_gemini_concurrency():
    """Initialize semaphore for Gemini API concurrency control"""
    global _gemini_semaphore, _gemini_async_semaphore
    if _gemini_semaphore is None and HAS_GEMINI:
        _gemini_semaphore = threading.Semaphore(AI_CORRECTION_MAX_CONCURRENT)
        # Don't initialize async semaphore here - will be created lazily when needed
        # This avoids issues with event loop not being available at import time
        logger.info(
            f"Initialized Gemini API concurrency control: max {AI_CORRECTION_MAX_CONCURRENT} concurrent requests (Đã khởi tạo kiểm soát đồng thời Gemini API: tối đa {AI_CORRECTION_MAX_CONCURRENT} request đồng thời)"
        )

def _get_async_semaphore():
    """Get or create async semaphore lazily (must be called from async context)"""
    global _gemini_async_semaphore
    if _gemini_async_semaphore is None and HAS_GEMINI:
        try:
            # Get current event loop (must be in async context)
            loop = asyncio.get_running_loop()
            _gemini_async_semaphore = asyncio.Semaphore(AI_CORRECTION_MAX_CONCURRENT)
        except RuntimeError:
            # No event loop running - this should not happen in async context
            # But if it does, we'll create it anyway (it will be bound to default loop)
            _gemini_async_semaphore = asyncio.Semaphore(AI_CORRECTION_MAX_CONCURRENT)
    return _gemini_async_semaphore

def _get_available_key() -> Optional[str]:
    """
    Get an available API key using round-robin with rate limit checking
    Returns None if no key is available
    """
    global _gemini_key_index  # Cần khai báo global để sửa biến global
    
    if not HAS_GEMINI or not GEMINI_API_KEYS or _gemini_key_lock is None:
        return GEMINI_API_KEYS[0] if GEMINI_API_KEYS else None
    
    with _gemini_key_lock:
        now = datetime.now()
        cutoff = now - timedelta(seconds=60)  # 1 minute window
        
        # Try each key in round-robin order
        start_index = _gemini_key_index
        for _ in range(len(GEMINI_API_KEYS)):
            key = GEMINI_API_KEYS[_gemini_key_index]
            _gemini_key_index = (_gemini_key_index + 1) % len(GEMINI_API_KEYS)
            
            # Check if key is blocked by 429 quota error
            blocked_until = _gemini_quota_blocked.get(key)
            if blocked_until and now < blocked_until:
                # Key is still blocked, skip it
                continue
            
            # Clean old requests for this key
            _gemini_rate_limiters[key]['requests'] = [
                req_time for req_time in _gemini_rate_limiters[key]['requests']
                if req_time > cutoff
            ]
            
            # Check if this key is available (not rate limited and not quota blocked)
            if len(_gemini_rate_limiters[key]['requests']) < AI_CORRECTION_RATE_LIMIT:
                return key
        
        # All keys are rate limited or quota blocked
        return None

def _mark_key_quota_blocked(key: str, block_duration_seconds: int = 60):
    """
    Đánh dấu một key bị block bởi 429 quota error
    """
    global _gemini_quota_blocked
    if _gemini_key_lock:
        with _gemini_key_lock:
            _gemini_quota_blocked[key] = datetime.now() + timedelta(seconds=block_duration_seconds)
            logger.debug(
                f"Marked key as quota blocked for {block_duration_seconds}s (Đánh dấu key bị quota block trong {block_duration_seconds}s)",
                extra={'extra_data': {
                    'key_index': GEMINI_API_KEYS.index(key) + 1 if key in GEMINI_API_KEYS else -1,
                    'block_duration': block_duration_seconds
                }}
            )

def _check_gemini_rate_limit_sync(key: Optional[str] = None) -> tuple[bool, Optional[str]]:
    """
    Kiểm tra rate limit cho Gemini API (sync version) với multi-key support
    Trả về (is_available, selected_key)
    """
    if not HAS_GEMINI or _gemini_rate_lock is None:
        return True, GEMINI_API_KEYS[0] if GEMINI_API_KEYS else None
    
    # Get available key
    selected_key = key or _get_available_key()
    if not selected_key:
        return False, None
    
    with _gemini_rate_lock:
        now = datetime.now()
        cutoff = now - timedelta(seconds=60)  # 1 minute window
        
        # Clean old requests for this key
        _gemini_rate_limiters[selected_key]['requests'] = [
            req_time for req_time in _gemini_rate_limiters[selected_key]['requests']
            if req_time > cutoff
        ]
        
        # Check if under limit
        if len(_gemini_rate_limiters[selected_key]['requests']) >= AI_CORRECTION_RATE_LIMIT:
            # Try to get another key
            another_key = _get_available_key()
            if another_key and another_key != selected_key:
                selected_key = another_key
                # Re-check for new key
                _gemini_rate_limiters[selected_key]['requests'] = [
                    req_time for req_time in _gemini_rate_limiters[selected_key]['requests']
                    if req_time > cutoff
                ]
                if len(_gemini_rate_limiters[selected_key]['requests']) >= AI_CORRECTION_RATE_LIMIT:
                    logger.warning(
                        f"All Gemini API keys rate limited (Tất cả Gemini API keys đã vượt rate limit)",
                        extra={'extra_data': {
                            'total_keys': len(GEMINI_API_KEYS),
                            'rate_limit_per_key': AI_CORRECTION_RATE_LIMIT
                        }}
                    )
                    return False, None
            else:
                logger.warning(
                    f"Gemini API rate limit exceeded for key: {len(_gemini_rate_limiters[selected_key]['requests'])}/{AI_CORRECTION_RATE_LIMIT} requests in last minute (Đã vượt rate limit Gemini API: {len(_gemini_rate_limiters[selected_key]['requests'])}/{AI_CORRECTION_RATE_LIMIT} requests trong phút vừa qua)",
                    extra={'extra_data': {
                        'current_requests': len(_gemini_rate_limiters[selected_key]['requests']),
                        'rate_limit': AI_CORRECTION_RATE_LIMIT,
                        'key_index': GEMINI_API_KEYS.index(selected_key) if selected_key in GEMINI_API_KEYS else -1
                    }}
                )
                return False, None
        
        # Add current request
        _gemini_rate_limiters[selected_key]['requests'].append(now)
        return True, selected_key

async def _check_gemini_rate_limit() -> tuple[bool, Optional[str]]:
    """
    Kiểm tra rate limit cho Gemini API (async version) với multi-key support
    Trả về (is_available, selected_key)
    """
    # Use sync version in async context
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _check_gemini_rate_limit_sync)

class GeminiCorrector:
    """AI-powered Vietnamese subtitle corrector using Gemini with multi-key support"""
    
    def __init__(self, api_key: Optional[str] = None):
        # Support single key (backward compatibility) or use multi-key
        self.api_keys = GEMINI_API_KEYS if GEMINI_API_KEYS else ([api_key] if api_key else [])
        self.current_key_index = 0
        self.models = {}  # Cache models per key
        
        # Check if AI correction is globally enabled
        try:
            from .config import AI_CORRECTION_ENABLED
            if not AI_CORRECTION_ENABLED:
                logger.info("AI correction is disabled globally (AI correction đã bị tắt toàn cục)")
                return
        except (ImportError, AttributeError):
            # Config not available, assume enabled
            pass
        
        if not HAS_GEMINI:
            logger.warning("Gemini library not available (Thư viện Gemini không khả dụng)")
            return
        
        if not self.api_keys:
            logger.warning("No Gemini API keys configured. AI correction disabled. (Không có Gemini API keys được cấu hình. AI correction đã tắt.)")
            return
        
        # Không cần initialize models nữa vì dùng REST API trực tiếp
        total_rate_limit = len(self.api_keys) * AI_CORRECTION_RATE_LIMIT
        logger.info(
            f"Gemini AI corrector initialized successfully with {len(self.api_keys)} key(s) using {GEMINI_MODEL} via REST API (Đã khởi tạo thành công Gemini AI corrector với {len(self.api_keys)} key(s) sử dụng {GEMINI_MODEL} qua REST API)",
            extra={'extra_data': {
                'total_keys': len(self.api_keys),
                'model': GEMINI_MODEL,
                'rate_limit_per_key': AI_CORRECTION_RATE_LIMIT,
                'total_rate_limit_per_minute': total_rate_limit,
                'method': 'REST_API'
            }}
        )
        
        # Initialize concurrency control
        _init_gemini_concurrency()
    
    def _call_gemini_rest_api(self, prompt: str, api_key: str) -> Dict:
        """
        Gọi Gemini API qua REST (giống như test Swagger)
        Trả về response dict hoặc raise exception
        """
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,  # Thấp để output ổn định
                "topP": 0.95,
                "topK": 40,
                "maxOutputTokens": 32768  # Đủ cho batch lớn
            },
            "safetySettings": [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_NONE"
                }
            ]
        }
        
        headers = {
            "x-goog-api-key": api_key,
            "Content-Type": "application/json"
        }
        
        response = requests.post(url, headers=headers, json=payload, timeout=120)
        response.raise_for_status()
        
        return response.json()
    
    def is_available(self) -> bool:
        """Check if AI correction is available"""
        return len(self.api_keys) > 0 and HAS_GEMINI
    
    async def _wait_for_rate_limit(self):
        """Wait if rate limit is exceeded"""
        if not HAS_GEMINI:
            return
        
        max_wait = 60  # Max wait 60 seconds
        wait_time = 0
        while not await _check_gemini_rate_limit():
            if wait_time >= max_wait:
                logger.error("Rate limit wait timeout (Hết thời gian chờ rate limit)")
                raise Exception("Gemini API rate limit exceeded")
            await asyncio.sleep(1)
            wait_time += 1
        
        # Wait for semaphore (concurrency control) - lazy initialization
        semaphore = _get_async_semaphore()
        if semaphore:
            await semaphore.acquire()
    
    def _release_semaphore(self):
        """Release semaphore after API call (sync)"""
        if _gemini_semaphore:
            _gemini_semaphore.release()
    
    async def _release_async_semaphore(self):
        """Release semaphore after API call (async)"""
        semaphore = _get_async_semaphore()
        if semaphore:
            semaphore.release()
    
    def correct_batch(self, segments: List[Dict], batch_size: int = None) -> List[Dict]:
        """
        Correct multiple segments in batches for efficiency
        Reduced batch_size to 5 for faster response
        """
        if not self.is_available():
            logger.warning("AI correction not available, returning original segments (AI correction không khả dụng, trả về segments gốc)")
            return segments
        
        # Always send all segments in one batch (like direct file upload)
        # This avoids quota/timeout issues from multiple requests
        if batch_size is None:
            batch_size = len(segments)  # Send all segments in one batch
        
        total_start = time.time()
        corrected = []
        total = len(segments)
        total_batches = (total + batch_size - 1) // batch_size
        
        logger.info(
            f"Starting AI correction batch processing (Bắt đầu xử lý AI correction theo batch)",
            extra={'extra_data': {
                'total_segments': total,
                'batch_size': batch_size,
                'total_batches': total_batches,
                'model': GEMINI_MODEL,
                'total_api_keys': len(self.api_keys),
                'rate_limit_per_key': AI_CORRECTION_RATE_LIMIT,
                'max_total_requests_per_minute': len(self.api_keys) * AI_CORRECTION_RATE_LIMIT
            }}
        )
        
        for i in range(0, total, batch_size):
            batch_num = i // batch_size + 1
            batch = segments[i:i+batch_size]
            batch_start = time.time()
            
            try:
                logger.debug(
                    f"Processing batch {batch_num}/{total_batches} (Đang xử lý batch {batch_num}/{total_batches})",
                    extra={'extra_data': {
                        'batch_num': batch_num,
                        'batch_size': len(batch),
                        'segment_indices': f"{i+1}-{min(i+batch_size, total)}"
                    }}
                )
                
                corrected_batch = self._correct_batch_internal(batch)
                corrected.extend(corrected_batch)
                
                batch_time = time.time() - batch_start
                corrected_count = sum(1 for s in corrected_batch if s.get('ai_corrected', False))
                
                logger.info(
                    f"Batch {batch_num}/{total_batches} completed (Hoàn thành batch {batch_num}/{total_batches})",
                    extra={'extra_data': {
                        'batch_num': batch_num,
                        'batch_time_seconds': round(batch_time, 2),
                        'corrected_in_batch': corrected_count,
                        'total_in_batch': len(batch)
                    }}
                )
            except Exception as e:
                batch_time = time.time() - batch_start
                log_error_with_context(logger, e, {
                    'batch_num': batch_num,
                    'batch_size': len(batch),
                    'batch_time_seconds': round(batch_time, 2),
                    'segment_indices': f"{i+1}-{min(i+batch_size, total)}"
                })
                # Return original on error
                corrected.extend(batch)
        
        total_time = time.time() - total_start
        total_corrected = sum(1 for s in corrected if s.get('ai_corrected', False))
        
        log_performance(logger, 'ai_correction_batch', total_time, **{
            'total_segments': total,
            'corrected_count': total_corrected,
            'correction_rate': round(total_corrected / total * 100, 1) if total > 0 else 0,
            'batches': total_batches
        })
        
        return corrected
    
    def _correct_batch_internal(self, batch: List[Dict]) -> List[Dict]:
        """Internal method to correct a single batch with multi-key support"""
        # Check rate limit and get available key (sync version)
        is_available, selected_key = _check_gemini_rate_limit_sync()
        if not is_available or not selected_key:
            logger.warning(
                f"Rate limit exceeded for all keys, waiting... (Đã vượt rate limit cho tất cả keys, đang chờ...)",
                extra={'extra_data': {
                    'rate_limit': AI_CORRECTION_RATE_LIMIT,
                    'total_keys': len(self.api_keys)
                }}
            )
            # Wait a bit before retrying
            time.sleep(2)
            # Retry once
            is_available, selected_key = _check_gemini_rate_limit_sync()
            if not is_available or not selected_key:
                logger.error("Rate limit still exceeded after wait (Vẫn vượt rate limit sau khi chờ)")
                return batch  # Return original batch if rate limited
        
        # Prepare text for correction
        texts = [f"{i+1}. {seg['text']}" for i, seg in enumerate(batch)]
        combined_text = "\n".join(texts)
        
        # Prompt đơn giản hóa để tránh safety filter (giống như test trực tiếp)
        prompt = f"Sửa đúng chính tả tiếng việt, tự sửa, không giải thích và không in đậm:\n{combined_text}"
        try:
            key_index = self.api_keys.index(selected_key) if selected_key in self.api_keys else -1
            logger.debug(
                f"Using API key {key_index + 1}/{len(self.api_keys)} for batch correction via REST API (Sử dụng API key {key_index + 1}/{len(self.api_keys)} cho batch correction qua REST API)",
                extra={'extra_data': {
                    'key_index': key_index + 1,
                    'total_keys': len(self.api_keys)
                }}
            )
            
            # Use semaphore for concurrency control (sync version)
            if _gemini_semaphore:
                _gemini_semaphore.acquire()
            
            try:
                # Gọi REST API (giống như test Swagger)
                response_json = self._call_gemini_rest_api(prompt, selected_key)
            finally:
                if _gemini_semaphore:
                    _gemini_semaphore.release()
            
            # Parse response từ REST API
            if not response_json.get('candidates') or len(response_json['candidates']) == 0:
                logger.warning(
                    "No candidates in response from Gemini API (Không có candidates trong response từ Gemini API)",
                    extra={'extra_data': {
                        'batch_size': len(batch),
                        'fallback': True
                    }}
                )
                return self._correct_batch_fallback(batch)
            
            candidate = response_json['candidates'][0]
            finish_reason = candidate.get('finishReason')
            
            # Kiểm tra finish_reason
            if finish_reason and finish_reason != 'STOP':
                # Bị block hoặc lỗi khác
                logger.warning(
                    f"Content blocked or error (finish_reason={finish_reason}) (Nội dung bị chặn hoặc lỗi - finish_reason={finish_reason})",
                    extra={'extra_data': {
                        'finish_reason': finish_reason,
                        'batch_size': len(batch),
                        'fallback': True
                    }}
                )
                return self._correct_batch_fallback(batch)
            
            # Lấy text từ response
            content = candidate.get('content', {})
            parts = content.get('parts', [])
            if not parts or not parts[0].get('text'):
                logger.warning(
                    "Empty response from Gemini API (Phản hồi trống từ Gemini API)",
                    extra={'extra_data': {
                        'batch_size': len(batch),
                        'fallback': True
                    }}
                )
                return self._correct_batch_fallback(batch)
            
            corrected_text = parts[0]['text'].strip()
            if not corrected_text:
                logger.warning(
                    "Empty corrected text (Text đã sửa trống)",
                    extra={'extra_data': {
                        'batch_size': len(batch),
                        'fallback': True
                    }}
                )
                return self._correct_batch_fallback(batch)
            
            # Parse corrected text back to segments
            # Nếu chỉ có 1 segment, Gemini trả về text liền mạch (không có "1. ")
            if len(batch) == 1:
                # Trường hợp đơn giản: chỉ có 1 segment, dùng toàn bộ text đã sửa
                corrected_text_clean = corrected_text.strip()
                original_text = batch[0]['text'].strip()
                
                if corrected_text_clean != original_text:
                    logger.debug(
                        f"Text corrected (1 segment) (Đã sửa text - 1 segment)",
                        extra={'extra_data': {
                            'original': original_text[:100],
                            'corrected': corrected_text_clean[:100]
                        }}
                    )
                    return [{**batch[0], 'text': corrected_text_clean, 'ai_corrected': True}]
                else:
                    return [{**batch[0], 'ai_corrected': False}]
            
            # Nếu có nhiều segments, parse theo format "1. text\n2. text" hoặc liền mạch
            corrected_lines = [line.strip() for line in corrected_text.split('\n') if line.strip()]
            corrected_segments = []
            
            for i, seg in enumerate(batch):
                corrected_line = None
                
                # Method 1: Tìm theo format "1. text", "2. text", ...
                for line in corrected_lines:
                    # Thử nhiều format: "1.", "1)", v.v.
                    if (line.startswith(f"{i+1}.") or 
                        line.startswith(f"{i+1})")):
                        # Extract text sau số thứ tự
                        if line.startswith(f"{i+1}."):
                            corrected_line = line[len(f"{i+1}."):].strip()
                        elif line.startswith(f"{i+1})"):
                            corrected_line = line[len(f"{i+1})"):].strip()
                        break
                
                # Method 2: Nếu không tìm thấy theo format số, thử lấy theo thứ tự dòng
                if not corrected_line and i < len(corrected_lines):
                    # Nếu số dòng khớp với số segments, có thể là format liền mạch
                    potential_line = corrected_lines[i]
                    # Kiểm tra xem có phải là số thứ tự của segment khác không
                    is_numbered = any(potential_line.startswith(f"{j+1}.") or potential_line.startswith(f"{j+1})") 
                                   for j in range(len(batch)))
                    if not is_numbered:
                        corrected_line = potential_line
                
                # Method 3: Nếu vẫn không tìm thấy, dùng text gốc (không sửa)
                if not corrected_line:
                    corrected_line = seg['text']
                
                # Check if actually changed
                if corrected_line != seg['text']:
                    logger.debug(
                        f"Text corrected (Đã sửa text)",
                        extra={'extra_data': {
                            'segment_index': i+1,
                            'original': seg['text'][:100],
                            'corrected': corrected_line[:100]
                        }}
                    )
                    corrected_segments.append({**seg, 'text': corrected_line, 'ai_corrected': True})
                else:
                    corrected_segments.append({**seg, 'ai_corrected': False})
            
            return corrected_segments
            
        except requests.exceptions.HTTPError as e:
            # HTTP error từ REST API
            error_msg = str(e)
            status_code = None
            if e.response is not None:
                status_code = e.response.status_code
                try:
                    error_detail = e.response.json()
                    error_msg = str(error_detail)
                except:
                    error_msg = e.response.text or str(e)
            
            # Xử lý 429 (quota exceeded) đặc biệt
            if status_code == 429:
                return self._handle_quota_error(batch, selected_key, error_msg)
            
            logger.warning(
                f"HTTP error from Gemini REST API (Lỗi HTTP từ Gemini REST API)",
                extra={'extra_data': {
                    'error': error_msg,
                    'status_code': status_code,
                    'batch_size': len(batch),
                    'fallback': True
                }}
            )
            return self._correct_batch_fallback(batch)
        except Exception as e:
            error_msg = str(e)
            error_type = type(e).__name__
            
            # Xử lý ResourceExhausted (429 - quota exceeded)
            if "ResourceExhausted" in error_type or "429" in error_msg or "quota" in error_msg.lower():
                return self._handle_quota_error(batch, selected_key, error_msg)
            
            log_error_with_context(logger, e, {
                'operation': 'gemini_batch_correction',
                'batch_size': len(batch),
                'error_message': error_msg,
                'error_type': error_type
            })
            
            # Nếu bị safety filter, thử fallback
            if "safety" in error_msg.lower() or "blocked" in error_msg.lower() or "block_reason" in error_msg:
                logger.info(
                    "Detected safety filter, trying fallback method (Phát hiện safety filter, thử phương pháp fallback)",
                    extra={'extra_data': {
                        'batch_size': len(batch),
                        'error_type': 'safety_filter'
                    }}
                )
                return self._correct_batch_fallback(batch)
            
            # Lỗi khác - dùng fallback
            logger.warning(
                f"Error calling Gemini REST API (Lỗi khi gọi Gemini REST API)",
                extra={'extra_data': {
                    'error': error_msg,
                    'batch_size': len(batch),
                    'fallback': True
                }}
            )
            return self._correct_batch_fallback(batch)
    
    def _handle_quota_error(self, batch: List[Dict], selected_key: Optional[str], error_msg: str) -> List[Dict]:
        """Handle quota exceeded (429) errors by blocking key and retrying with another"""
        import re
        retry_delay = 60  # Default 60 seconds (1 minute)
        try:
            delay_match = re.search(r'retry_delay.*?seconds.*?(\d+)', error_msg, re.IGNORECASE)
            if delay_match:
                retry_delay = int(delay_match.group(1)) + 1
            else:
                delay_match = re.search(r'retry in ([\d.]+)s', error_msg, re.IGNORECASE)
                if delay_match:
                    retry_delay = int(float(delay_match.group(1))) + 1
        except:
            pass
        
        # Đánh dấu key này bị block và chuyển sang key khác
        if selected_key:
            _mark_key_quota_blocked(selected_key, retry_delay)
            logger.warning(
                f"Quota exceeded (429) for key, switching to another key (Đã vượt quota (429) cho key, chuyển sang key khác)",
                extra={'extra_data': {
                    'batch_size': len(batch),
                    'blocked_key_index': self.api_keys.index(selected_key) + 1 if selected_key in self.api_keys else -1,
                    'block_duration_seconds': retry_delay,
                    'total_keys': len(self.api_keys),
                    'error_type': 'ResourceExhausted'
                }}
            )
        
        # Thử lại ngay với key khác (không chờ)
        logger.info(
            "Retrying with another key after quota error (Thử lại với key khác sau lỗi quota)",
            extra={'extra_data': {
                'batch_size': len(batch),
                'method': 'retry_with_another_key'
            }}
        )
        # Retry với key khác
        try:
            return self._correct_batch_internal(batch)
        except Exception as retry_error:
            # Nếu tất cả keys đều bị block, dùng fallback
            logger.warning(
                "All keys quota blocked, using fallback method (Tất cả keys đều bị quota block, dùng phương pháp fallback)",
                extra={'extra_data': {
                    'batch_size': len(batch),
                    'retry_error': str(retry_error)[:100]
                }}
            )
            return self._correct_batch_fallback(batch)
    
    def _correct_segment_with_retry(self, seg: Dict, retry_count: int = 2) -> Dict:
        """
        Sửa một segment với retry mechanism khi bị lỗi (429, timeout, etc.)
        Dùng 1 prompt chính, chỉ retry khi gặp lỗi kỹ thuật
        """
        text = seg['text']
        
        # Prompt chính - tối ưu cho tiếng Việt
        prompt = (
            f"Sửa chính tả tiếng Việt cho câu sau (chỉ trả về text đã sửa, không giải thích):\n{text}"
        )
        
        current_key = None  # Track current key being used
        for attempt_idx in range(retry_count + 1):
            try:
                # Check rate limit and get available key before each attempt
                is_available, selected_key = _check_gemini_rate_limit_sync()
                if not is_available or not selected_key:
                    # Wait for rate limit
                    wait_time = 60  # Wait up to 60 seconds
                    logger.warning(
                        f"Rate limit exceeded, waiting {wait_time}s before retry (Đã vượt rate limit, chờ {wait_time}s trước khi thử lại)",
                        extra={'extra_data': {
                            'attempt': attempt_idx + 1,
                            'wait_seconds': wait_time,
                            'total_keys': len(self.api_keys)
                        }}
                    )
                    time.sleep(wait_time)
                    # Retry getting key
                    is_available, selected_key = _check_gemini_rate_limit_sync()
                    if not is_available or not selected_key:
                        continue  # Skip this attempt
                
                current_key = selected_key  # Track current key
                
                key_index = self.api_keys.index(selected_key) if selected_key in self.api_keys else -1
                logger.debug(
                    f"Using API key {key_index + 1}/{len(self.api_keys)} for segment correction via REST API (Sử dụng API key {key_index + 1}/{len(self.api_keys)} cho segment correction qua REST API)",
                    extra={'extra_data': {
                        'key_index': key_index + 1,
                        'total_keys': len(self.api_keys),
                        'attempt': attempt_idx + 1
                    }}
                )
                
                # Use semaphore for concurrency control
                if _gemini_semaphore:
                    _gemini_semaphore.acquire()
                
                try:
                    # Gọi REST API với prompt chính
                    response_json = self._call_gemini_rest_api(prompt, selected_key)
                finally:
                    if _gemini_semaphore:
                        _gemini_semaphore.release()
                
                # Parse response từ REST API
                if not response_json.get('candidates') or len(response_json['candidates']) == 0:
                    # Empty response - thử lại nếu chưa hết attempts
                    if attempt_idx < retry_count:
                        logger.debug(
                            f"Empty response (attempt {attempt_idx + 1}/{retry_count + 1}), retrying... (Phản hồi trống - lần thử {attempt_idx + 1}/{retry_count + 1}, thử lại...)",
                            extra={'extra_data': {
                                'attempt': attempt_idx + 1,
                                'total_attempts': retry_count + 1
                            }}
                        )
                        time.sleep(1)  # Small delay before retry
                        continue
                    else:
                        return {**seg, 'ai_corrected': False}
                
                candidate = response_json['candidates'][0]
                finish_reason = candidate.get('finishReason')
                
                # Kiểm tra finish_reason
                if finish_reason and finish_reason != 'STOP':
                    # Bị block hoặc lỗi - thử lại nếu chưa hết attempts
                    block_reason = finish_reason
                    if attempt_idx < retry_count:
                        logger.debug(
                            f"Segment blocked (attempt {attempt_idx + 1}/{retry_count + 1}, reason={block_reason}), retrying... (Segment bị chặn - lần thử {attempt_idx + 1}/{retry_count + 1}, lý do={block_reason}, thử lại...)",
                            extra={'extra_data': {
                                'attempt': attempt_idx + 1,
                                'total_attempts': retry_count + 1,
                                'block_reason': block_reason
                            }}
                        )
                        time.sleep(1)  # Small delay before retry
                        continue
                    else:
                        logger.warning(
                            f"Segment blocked after all retries (reason={block_reason}) (Segment bị chặn sau tất cả các lần thử - lý do={block_reason})",
                            extra={'extra_data': {
                                'block_reason': block_reason,
                                'total_attempts': retry_count + 1,
                                'text_preview': text[:50]
                            }}
                        )
                        return {**seg, 'ai_corrected': False}
                
                # Lấy text từ response
                content = candidate.get('content', {})
                parts = content.get('parts', [])
                if not parts or not parts[0].get('text'):
                    # Empty response - thử lại nếu chưa hết attempts
                    if attempt_idx < retry_count:
                        logger.debug(
                            f"Empty content (attempt {attempt_idx + 1}/{retry_count + 1}), retrying... (Nội dung trống - lần thử {attempt_idx + 1}/{retry_count + 1}, thử lại...)",
                            extra={'extra_data': {
                                'attempt': attempt_idx + 1,
                                'total_attempts': retry_count + 1
                            }}
                        )
                        time.sleep(1)  # Small delay before retry
                        continue
                    else:
                        return {**seg, 'ai_corrected': False}
                
                corrected_text = parts[0]['text'].strip()
                if not corrected_text:
                    # Empty text - thử lại nếu chưa hết attempts
                    if attempt_idx < retry_count:
                        logger.debug(
                            f"Empty corrected text (attempt {attempt_idx + 1}/{retry_count + 1}), retrying... (Text sửa trống - lần thử {attempt_idx + 1}/{retry_count + 1}, thử lại...)",
                            extra={'extra_data': {
                                'attempt': attempt_idx + 1,
                                'total_attempts': retry_count + 1
                            }}
                        )
                        time.sleep(1)  # Small delay before retry
                        continue
                    else:
                        return {**seg, 'ai_corrected': False}
                
                # Nếu đến đây thì đã có corrected_text, xử lý kết quả
                if corrected_text != text:
                    return {**seg, 'text': corrected_text, 'ai_corrected': True}
                else:
                    return {**seg, 'ai_corrected': False}
                        
            except Exception as e:
                error_msg = str(e)
                error_type = type(e).__name__
                
                # Xử lý ResourceExhausted (429 - quota exceeded)
                if "ResourceExhausted" in error_type or "429" in error_msg or "quota" in error_msg.lower():
                    # Parse retry delay from error message
                    retry_delay = 60  # Default 60 seconds (1 minute)
                    try:
                        # Try to extract retry_delay from error message
                        import re
                        delay_match = re.search(r'retry_delay.*?seconds.*?(\d+)', error_msg, re.IGNORECASE)
                        if delay_match:
                            retry_delay = int(delay_match.group(1)) + 1  # Add 1 second buffer
                        else:
                            # Try another pattern
                            delay_match = re.search(r'retry in ([\d.]+)s', error_msg, re.IGNORECASE)
                            if delay_match:
                                retry_delay = int(float(delay_match.group(1))) + 1
                    except:
                        pass
                    
                    # Đánh dấu key này bị block và chuyển sang key khác
                    # current_key đã được set ở đầu loop
                    if current_key:
                        _mark_key_quota_blocked(current_key, retry_delay)
                        logger.warning(
                            f"Quota exceeded (429) for key, switching to another key (Đã vượt quota (429) cho key, chuyển sang key khác)",
                            extra={'extra_data': {
                                'attempt': attempt_idx + 1,
                                'blocked_key_index': GEMINI_API_KEYS.index(current_key) + 1 if current_key in GEMINI_API_KEYS else -1,
                                'block_duration_seconds': retry_delay,
                                'total_keys': len(GEMINI_API_KEYS),
                                'error_type': error_type
                            }}
                        )
                    
                    # Thử lại ngay với key khác (không chờ) - chỉ retry nếu chưa hết attempts
                    if attempt_idx < retry_count:
                        logger.info(
                            f"Retrying with another key (attempt {attempt_idx + 2}/{retry_count + 1}) (Thử lại với key khác - lần thử {attempt_idx + 2}/{retry_count + 1})",
                            extra={'extra_data': {
                                'attempt': attempt_idx + 2,
                                'total_attempts': retry_count + 1
                            }}
                        )
                        time.sleep(1)  # Small delay before retry
                        continue
                    else:
                        # Đã thử hết, trả về gốc
                        logger.error(
                            f"Quota exceeded after all retries with all keys (Đã vượt quota sau tất cả các lần thử với tất cả keys)",
                            extra={'extra_data': {
                                'text_preview': text[:50],
                                'total_attempts': retry_count + 1,
                                'total_keys': len(GEMINI_API_KEYS)
                            }}
                        )
                        return {**seg, 'ai_corrected': False}
                
                # Nếu không phải attempt cuối, thử lại
                if attempt_idx < retry_count:
                    logger.debug(
                        f"Error in attempt {attempt_idx + 1}/{retry_count + 1}, retrying... (Lỗi ở lần thử {attempt_idx + 1}/{retry_count + 1}, thử lại...)",
                        extra={'extra_data': {
                            'attempt': attempt_idx + 1,
                            'total_attempts': retry_count + 1,
                            'error': str(e)[:100],
                            'error_type': error_type
                        }}
                    )
                    # Small delay before retry
                    time.sleep(1)
                    continue
                else:
                    log_error_with_context(logger, e, {
                        'operation': 'segment_correction_retry',
                        'text_preview': text[:50],
                        'total_attempts': retry_count + 1
                    })
                    return {**seg, 'ai_corrected': False}
        
        # Fallback: trả về gốc
        return {**seg, 'ai_corrected': False}
    
    def _correct_batch_fallback(self, batch: List[Dict]) -> List[Dict]:
        """Fallback method khi bị safety filter - sửa từng đoạn riêng lẻ với retry"""
        logger.info(
            "Using fallback correction method (individual segments with retry) (Sử dụng phương pháp fallback - sửa từng segment riêng lẻ với retry)",
            extra={'extra_data': {
                'batch_size': len(batch),
                'method': 'fallback_individual_retry'
            }}
        )
        corrected = []
        fallback_start = time.time()
        blocked_count = 0
        
        for i, seg in enumerate(batch):
            segment_start = time.time()
            
            # Add delay between segments to avoid rate limit
            # With multiple keys, we can reduce delay: 5 keys × 10 req/min = 50 req/min total
            if i > 0:
                # Calculate delay: 60 seconds / (number_of_keys * rate_limit_per_key)
                # For 5 keys with 10 req/min each: 60 / (5 * 10) = 1.2 seconds
                # Add buffer: use 2 seconds to be safe
                total_rate_limit = len(self.api_keys) * AI_CORRECTION_RATE_LIMIT
                delay = max(1.0, 60.0 / total_rate_limit + 0.5)  # At least 1 second, add 0.5s buffer
                time.sleep(delay)
            
            result = self._correct_segment_with_retry(seg, retry_count=2)
            corrected.append(result)
            
            segment_time = time.time() - segment_start
            
            # Thống kê
            if not result.get('ai_corrected', False):
                blocked_count += 1
        
        fallback_time = time.time() - fallback_start
        fallback_corrected = sum(1 for s in corrected if s.get('ai_corrected', False))
        blocked_segments = len(batch) - fallback_corrected
        
        logger.info(
            f"Fallback correction completed (Hoàn thành fallback correction)",
            extra={'extra_data': {
                'total_segments': len(batch),
                'corrected_count': fallback_corrected,
                'blocked_count': blocked_segments,
                'blocked_percentage': round(blocked_segments / len(batch) * 100, 1) if batch else 0,
                'total_time_seconds': round(fallback_time, 2),
                'avg_time_per_segment': round(fallback_time / len(batch), 2) if batch else 0
            }}
        )
        
        # Cảnh báo nếu quá nhiều segment bị block
        if blocked_segments > 0:
            blocked_pct = blocked_segments / len(batch) * 100
            if blocked_pct > 50:
                logger.warning(
                    f"High blocking rate: {blocked_pct:.1f}% segments blocked (Tỷ lệ chặn cao: {blocked_pct:.1f}% segments bị chặn)",
                    extra={'extra_data': {
                        'blocked_count': blocked_segments,
                        'total_segments': len(batch),
                        'blocked_percentage': round(blocked_pct, 1)
                    }}
                )
        
        return corrected
    
    def correct_single(self, text: str) -> str:
        """Correct a single text (for testing)"""
        if not self.is_available():
            return text
        
        result = self.correct_batch([{'text': text, 'start': 0, 'end': 1}])
        return result[0]['text'] if result else text

# Global instance
_corrector = None

def get_corrector() -> GeminiCorrector:
    """Get or create global corrector instance"""
    global _corrector
    if _corrector is None:
        _corrector = GeminiCorrector()
    return _corrector

def correct_segments_with_ai(segments: List[Dict], batch_size: int = None) -> List[Dict]:
    """
    Main entry point for AI correction
    Usage:
        segments = correct_segments_with_ai(segments)
    """
    # Check if AI correction is globally enabled
    if not AI_CORRECTION_ENABLED:
        logger.info("AI correction skipped (globally disabled) (Bỏ qua AI correction - đã tắt toàn cục)")
        return segments
    
    corrector = get_corrector()
    if not corrector.is_available():
        logger.info("AI correction skipped (not available) (Bỏ qua AI correction - không khả dụng)")
        return segments
    
    # Use configured batch size if not provided
    if batch_size is None:
        batch_size = AI_CORRECTION_BATCH_SIZE
    
    logger.info(f"Starting AI correction for {len(segments)} segments (Bắt đầu AI correction cho {len(segments)} segments)")
    corrected = corrector.correct_batch(segments, batch_size=batch_size)
    
    # Count corrections
    corrected_count = sum(1 for s in corrected if s.get('ai_corrected', False))
    logger.info(f"AI correction complete: {corrected_count}/{len(segments)} segments modified (Hoàn thành AI correction: {corrected_count}/{len(segments)} segments đã được sửa)")
    
    return corrected
