"""
Vietnamese language-specific optimization for subtitle accuracy
"""
import re
from typing import List, Tuple

# Comprehensive Vietnamese lexicon for common ASR errors
# Mở rộng để tăng độ chính xác
VI_LEXICON_RAW: List[Tuple[str, str]] = [
    # Common homophones and ASR errors
    (r"\bVí quyết\b", "Bí quyết"),
    (r"\bphòng vấn\b", "phỏng vấn"),
    (r"\btuy ít\b", "thuỷ điện"),
    (r"\bhi vọng\b", "hy vọng"),
    (r"\bdể dàng\b", "dễ dàng"),
    (r"\bchừng thức\b", "chứng thực"),
    (r"\bđê đà\b", "dễ dàng"),
    (r"\bki năng\b", "kỹ năng"),
    (r"\bki niệm\b", "kỷ niệm"),
    (r"\bki luật\b", "kỷ luật"),
    (r"\btuy\s+nhiên\b", "tuy nhiên"),
    (r"\bví\s+như\b", "ví như"),
    (r"\bví\s+dụ\b", "ví dụ"),
    (r"\btrung thành\b", "trung thành"),
    (r"\bcảm\s+ơn\b", "cảm ơn"),
    (r"\bxin\s+chào\b", "xin chào"),
    (r"\bhọc\s+sinh\b", "học sinh"),
    (r"\bsinh\s+viên\b", "sinh viên"),
    (r"\bgiảng\s+viên\b", "giảng viên"),
    (r"\bgiáo\s+viên\b", "giáo viên"),
    (r"\bthầy\s+cô\b", "thầy cô"),
    
    # Educational context specific
    (r"\bbài\s+học\b", "bài học"),
    (r"\bbài\s+tập\b", "bài tập"),
    (r"\bkiến\s+thức\b", "kiến thức"),
    (r"\bkhóa\s+học\b", "khóa học"),
    (r"\blớp\s+học\b", "lớp học"),
    (r"\bchương\s+trình\b", "chương trình"),
    (r"\bhọc\s+liệu\b", "học liệu"),
    (r"\btài\s+liệu\b", "tài liệu"),
    (r"\bnội\s+dung\b", "nội dung"),
    (r"\bphương\s+pháp\b", "phương pháp"),
    
    # Technical terms
    (r"\bcông\s+nghệ\b", "công nghệ"),
    (r"\btrí\s+tuệ\s+nhân\s+tạo\b", "trí tuệ nhân tạo"),
    (r"\blập\s+trình\b", "lập trình"),
    (r"\bdữ\s+liệu\b", "dữ liệu"),
    (r"\bmạng\s+xã\s+hội\b", "mạng xã hội"),
    
    # Job/Recruitment terms (common errors) - Mở rộng
    (r"\btiện\s+dụng\b", "tuyển dụng"),
    (r"\btử\s+dụng\b", "tuyển dụng"),
    (r"\btuy\s+dụng\b", "tuyển dụng"),
    (r"\bứng\s+viên\b", "ứng viên"),
    (r"\bứng\s+tuyển\b", "ứng tuyển"),
    (r"\bnhà\s+tiện\s+dụng\b", "nhà tuyển dụng"),
    (r"\bnhà\s+tử\s+dụng\b", "nhà tuyển dụng"),
    (r"\bnhà\s+tuy\s+dụng\b", "nhà tuyển dụng"),
    (r"\bmăng\s+thức\b", "thất bại"),
    (r"\bcá\s+trôi\s+duyên\b", "khả năng"),
    (r"\bhọc\s+hợp\b", "học hỏi"),
    (r"\bCV\b", "CV"),
    (r"\bresume\b", "resume"),
    (r"\btrả\s+lời\b", "trả lời"),
    (r"\bcâu\s+hỏi\b", "câu hỏi"),
    (r"\bkinh\s+nghiệm\b", "kinh nghiệm"),
    (r"\bdự\s+án\b", "dự án"),
    (r"\bphỏng\s+vấn\b", "phỏng vấn"),
    (r"\bứng\s+tuyển\s+viên\b", "ứng viên"),
    
    # Common ASR errors - Thêm nhiều hơn
    (r"\bchuyển\s+điểm\b", "trừ điểm"),
    (r"\bnăm\s+tốt\b", "năm giỏi"),
    (r"\bđồng\s+quốc\b", "đóng góp"),
    (r"\bthành\s+công\b", "thành công"),
    (r"\bthất\s+bại\b", "thất bại"),
    (r"\bkhả\s+năng\b", "khả năng"),
    (r"\bkỹ\s+năng\b", "kỹ năng"),
    (r"\bkinh\s+nghiệm\b", "kinh nghiệm"),
    (r"\bđào\s+tạo\b", "đào tạo"),
    (r"\bphát\s+triển\b", "phát triển"),
    (r"\bquản\s+lý\b", "quản lý"),
    (r"\blãnh\s+đạo\b", "lãnh đạo"),
    (r"\bđồng\s+nghiệp\b", "đồng nghiệp"),
    (r"\bkhách\s+hàng\b", "khách hàng"),
    (r"\bsản\s+phẩm\b", "sản phẩm"),
    (r"\bdịch\s+vụ\b", "dịch vụ"),
    (r"\bthị\s+trường\b", "thị trường"),
    (r"\bdoanh\s+nghiệp\b", "doanh nghiệp"),
    (r"\bcông\s+ty\b", "công ty"),
    (r"\bnhân\s+viên\b", "nhân viên"),
    (r"\bgiám\s+đốc\b", "giám đốc"),
    (r"\btrưởng\s+phòng\b", "trưởng phòng"),
    
    # Common pronunciation errors
    (r"\bthì\s+giờ\b", "thời gian"),
    (r"\bgiải\s+thích\b", "giải thích"),
    (r"\bgiải\s+quyết\b", "giải quyết"),
    (r"\bthực\s+hiện\b", "thực hiện"),
    (r"\bthực\s+tế\b", "thực tế"),
    (r"\bthực\s+tiễn\b", "thực tiễn"),
    (r"\bphát\s+biểu\b", "phát biểu"),
    (r"\bphát\s+triển\b", "phát triển"),
    (r"\bphát\s+hiện\b", "phát hiện"),
    
    # Numbers and dates
    (r"\bmột\s+trăm\b", "một trăm"),
    (r"\bhai\s+trăm\b", "hai trăm"),
    (r"\bngàn\b", "nghìn"),
    (r"\btriệu\b", "triệu"),
    (r"\btỷ\b", "tỷ"),
]

# Compile regex patterns once for better performance
_VI_LEXICON_COMPILED = [
    (re.compile(pattern, re.IGNORECASE), replacement)
    for pattern, replacement in VI_LEXICON_RAW
]

# Backward compatibility
VI_LEXICON = VI_LEXICON_RAW

# Vietnamese stop words that might leak from prompts
VI_PROMPT_PATTERNS = [
    "phụ đề tiếng việt",
    "viết hoa đầu câu", 
    "có dấu câu",
    "chủ đề",
    "nội dung",
    "transcript",
    "subtitles",
]

# Common filler words and artifacts to clean - compile regex
VI_FILLER_WORDS_COMPILED = [
    re.compile(pattern, re.IGNORECASE) for pattern in [
        r"\bà\s+à\b",
        r"\bờ\s+ờ\b", 
        r"\bừ\s+ừ\b",
        r"\bư\s+ư\b",
        r"\bè\s+è\b",
        r"\bụ\s+ụ\b",
    ]
]

# Compile punctuation patterns once
_PUNCT_SPACE_BEFORE = re.compile(r'\s+([,.!?;:])')
_PUNCT_SPACE_AFTER = re.compile(r'([,.!?;:])([^\s\d])')
_QUOTE_SPACE_BEFORE = re.compile(r'"\s+')
_QUOTE_SPACE_AFTER = re.compile(r'\s+"')
_MULTIPLE_DOTS = re.compile(r'\.{2,}')
_MULTIPLE_EXCLAM = re.compile(r'!{2,}')
_MULTIPLE_QUEST = re.compile(r'\?{2,}')
_WHITESPACE = re.compile(r'\s+')
_SENTENCE_END = re.compile(r'([.!?…]\s+)([a-zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ])')

def apply_vietnamese_lexicon(text: str) -> str:
    """Apply Vietnamese-specific corrections (optimized with pre-compiled regex)"""
    for pattern, replacement in _VI_LEXICON_COMPILED:
        text = pattern.sub(replacement, text)
    return text

def remove_filler_words(text: str) -> str:
    """Remove common Vietnamese filler words and artifacts (optimized)"""
    for pattern in VI_FILLER_WORDS_COMPILED:
        text = pattern.sub("", text)
    return _WHITESPACE.sub(' ', text).strip()

def looks_like_prompt_leak(text: str) -> bool:
    """Detect if text contains prompt artifacts"""
    text_lower = text.lower()
    return any(pattern in text_lower for pattern in VI_PROMPT_PATTERNS)

def normalize_vietnamese_punctuation(text: str) -> str:
    """Normalize Vietnamese punctuation and spacing (optimized with pre-compiled regex)"""
    # Remove space before punctuation
    text = _PUNCT_SPACE_BEFORE.sub(r'\1', text)
    
    # Ensure space after punctuation
    text = _PUNCT_SPACE_AFTER.sub(r'\1 \2', text)
    
    # Fix quote spacing
    text = _QUOTE_SPACE_BEFORE.sub('"', text)
    text = _QUOTE_SPACE_AFTER.sub('"', text)
    
    # Normalize multiple punctuation
    text = _MULTIPLE_DOTS.sub('...', text)
    text = _MULTIPLE_EXCLAM.sub('!', text)
    text = _MULTIPLE_QUEST.sub('?', text)
    
    # Normalize whitespace
    text = _WHITESPACE.sub(' ', text)
    
    return text.strip()

def capitalize_vietnamese_sentence(text: str) -> str:
    """Proper capitalization for Vietnamese sentences (optimized)"""
    if not text:
        return text
    
    # Capitalize first letter
    text = text[0].upper() + text[1:] if len(text) > 1 else text.upper()
    
    # Capitalize after sentence endings (using pre-compiled regex)
    text = _SENTENCE_END.sub(lambda m: m.group(1) + m.group(2).upper(), text)
    
    return text

def enhance_vietnamese_text(text: str) -> str:
    """Complete Vietnamese text enhancement pipeline"""
    # Remove filler words
    text = remove_filler_words(text)
    
    # Apply lexicon corrections
    text = apply_vietnamese_lexicon(text)
    
    # Normalize punctuation
    text = normalize_vietnamese_punctuation(text)
    
    # Proper capitalization
    text = capitalize_vietnamese_sentence(text)
    
    return text

# Optimized prompts for Vietnamese ASR
# Prompts được tối ưu để tăng độ chính xác cho Whisper model
# Format: ngắn gọn, chứa từ khóa quan trọng, có ví dụ về dấu câu
# Thêm nhiều từ khóa quan trọng để guide model tốt hơn
VIETNAMESE_PROMPTS = {
    "education": (
        "Đây là nội dung giáo dục tiếng Việt. "
        "Giảng viên giảng bài, học sinh đặt câu hỏi. "
        "Từ khóa: bài học, bài tập, kiến thức, khóa học, lớp học, chương trình, học liệu, tài liệu, nội dung, phương pháp. "
        "Sử dụng dấu câu đúng: dấu chấm, dấu phẩy, dấu hỏi. "
        "Viết hoa đầu câu. Ví dụ: 'Xin chào các bạn. Hôm nay chúng ta học về gì?'"
    ),
    "interview": (
        "Đây là cuộc phỏng vấn tiếng Việt chuyên nghiệp. "
        "Người phỏng vấn hỏi, ứng viên trả lời. "
        "Từ khóa: tuyển dụng, ứng viên, phỏng vấn, kinh nghiệm, kỹ năng, CV, resume, nhà tuyển dụng, ứng tuyển, dự án. "
        "Sử dụng dấu câu chuẩn. Viết hoa đầu câu. "
        "Ví dụ: 'Bạn có kinh nghiệm gì? Tôi có 5 năm kinh nghiệm.'"
    ),
    "lecture": (
        "Đây là bài giảng tiếng Việt chuyên môn. "
        "Có nhiều thuật ngữ kỹ thuật, từ chuyên ngành. "
        "Từ khóa: công nghệ, trí tuệ nhân tạo, lập trình, dữ liệu, mạng xã hội, phần mềm, hệ thống. "
        "Sử dụng dấu câu đúng. Viết hoa đầu câu. "
        "Ví dụ: 'Công nghệ thông tin là gì? Đây là lĩnh vực quan trọng.'"
    ),
    "conversation": (
        "Đây là hội thoại tiếng Việt tự nhiên. "
        "Người nói trao đổi với nhau. "
        "Từ khóa: xin chào, cảm ơn, bạn, tôi, chúng ta, họ, chúng tôi. "
        "Sử dụng dấu chấm câu đúng. Viết hoa đầu câu. "
        "Ví dụ: 'Bạn đi đâu vậy? Tôi đi mua đồ.'"
    ),
    "presentation": (
        "Đây là bài thuyết trình tiếng Việt. "
        "Diễn đạt rõ ràng, có cấu trúc. "
        "Từ khóa: chào mừng, trình bày, giới thiệu, kết luận, tóm tắt, nội dung chính. "
        "Sử dụng dấu câu đúng. Viết hoa đầu câu. "
        "Ví dụ: 'Chào mừng các bạn. Hôm nay tôi trình bày về chủ đề này.'"
    ),
}

def get_optimized_prompt(context: str = "education") -> str:
    """Get optimized prompt for Vietnamese context"""
    return VIETNAMESE_PROMPTS.get(context, VIETNAMESE_PROMPTS["education"])
