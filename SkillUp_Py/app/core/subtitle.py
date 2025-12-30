import re
from pathlib import Path
from typing import List, Dict, Any

# Pre-compile regex patterns for better performance
_SENTENCE_SPLIT = re.compile(r'(?<=[.!?…])\s+')
_WHITESPACE = re.compile(r'\s+')


def fmt_vtt(sec: float) -> str:
    t = int(sec * 1000); h, t = divmod(t, 3600000); m, t = divmod(t, 60000); s, ms = divmod(t, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}.{ms:03d}"

def fmt_srt(sec: float) -> str:
    t = int(sec * 1000); h, t = divmod(t, 3600000); m, t = divmod(t, 60000); s, ms = divmod(t, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def norm(text: str) -> str:
    """Normalize text - simple cleanup"""
    # Chuẩn hóa khoảng trắng
    text = _WHITESPACE.sub(' ', text.strip())
    # Viết hoa chữ cái đầu câu
    if text and text[0].islower():
        text = text[0].upper() + text[1:]
    return text

def merge_segments(segs, max_gap=0.35, min_dur=1.2, confidence_threshold=0.3):
    """Merge segments with confidence-based filtering (optimized)"""
    if not segs:
        return []
    
    # Filter and convert in one pass
    xs = []
    for s in segs:
        # Handle both dict and object segments
        if isinstance(s, dict):
            # Filter low confidence segments early
            conf = s.get('confidence', 1.0)
            if conf < confidence_threshold:
                continue
            xs.append({
                "start": s["start"],
                "end": s["end"],
                "text": s["text"].strip(),
                "confidence": conf
            })
        else:
            xs.append({
                "start": s.start,
                "end": s.end,
                "text": s.text.strip(),
                "confidence": 1.0
            })
    
    if not xs:
        return []
    
    # Sort once (in-place for better performance)
    xs.sort(key=lambda x: x["start"])
    
    # Merge segments
    out = []
    for s in xs:
        if not out:
            out.append(s)
            continue
        
        last = out[-1]
        gap = s["start"] - last["end"]
        last_d = last["end"] - last["start"]
        
        if gap <= max_gap or last_d < min_dur:
            # Merge with current segment
            last["end"] = max(last["end"], s["end"])
            last["text"] = (last["text"] + " " + s["text"]).strip()
            # Weighted average confidence (by duration)
            last_conf = last.get("confidence", 1.0)
            s_conf = s.get("confidence", 1.0)
            last_dur = last["end"] - last["start"]
            s_dur = s["end"] - s["start"]
            total_dur = last_dur + s_dur
            if total_dur > 0:
                last["confidence"] = (last_conf * last_dur + s_conf * s_dur) / total_dur
            else:
                last["confidence"] = (last_conf + s_conf) / 2
        else:
            out.append(s)
    
    # Normalize all at once (more efficient)
    for s in out:
        s["text"] = norm(s["text"])
    
    return out

def dedupe_repetition(text: str) -> str:
    """Remove duplicate sentences (optimized with pre-compiled regex)"""
    parts = _SENTENCE_SPLIT.split(text.strip())
    seen = []
    for p in parts:
        if not seen or p != seen[-1]:
            seen.append(p)
    out = " ".join(seen).strip()
    return _WHITESPACE.sub(' ', out)

def split_long_segments(merged, max_dur=6.0, max_chars=120):
    """Split long segments (optimized with pre-compiled regex)"""
    results = []
    for s in merged:
        dur = s["end"] - s["start"]
        txt = s["text"]
        if dur <= max_dur and len(txt) <= max_chars:
            results.append(s)
            continue
        
        sentences = _SENTENCE_SPLIT.split(txt)
        total_chars = sum(len(x) for x in sentences if x)
        if total_chars == 0:
            results.append(s)
            continue
        
        cur_start = s["start"]
        for sent in sentences:
            if not sent:
                continue
            ratio = len(sent) / total_chars
            seg_dur = max(1.0, dur * ratio)
            cur_end = min(s["end"], cur_start + seg_dur)
            results.append({"start": cur_start, "end": cur_end, "text": sent.strip()})
            cur_start = cur_end
    return results

def post_cleanup_caps(segs):
    """Cleanup segments (optimized: single pass)"""
    cleaned = []
    for s in segs:
        t = s["text"]
        # Dedupe và normalize
        t = dedupe_repetition(t)
        t = norm(t)  # Apply normalization
        cleaned.append({**s, "text": t})
    return cleaned

def merge_all_segments(segs):
    """
    Merge tất cả segments thành 1 segment duy nhất (text nối liền nhau trên 1 hàng)
    """
    if not segs:
        return []
    
    if len(segs) == 1:
        return segs
    
    # Merge tất cả thành 1 segment
    first = segs[0]
    last = segs[-1]
    
    # Nối tất cả text lại với nhau
    all_text = " ".join(s["text"].strip() for s in segs if s.get("text", "").strip())
    
    return [{
        "start": first["start"],
        "end": last["end"],
        "text": all_text.strip(),
        "confidence": sum(s.get("confidence", 1.0) for s in segs) / len(segs) if segs else 1.0
    }]

def write_vtt(segs, out_path: Path):
    """Write VTT file (optimized with buffered writing)"""
    with out_path.open("w", encoding="utf-8", buffering=8192) as f:
        f.write("WEBVTT\n\n")
        # Pre-format all segments for better performance
        lines = []
        for i, s in enumerate(segs, 1):
            lines.append(f"{i}\n{fmt_vtt(s['start'])} --> {fmt_vtt(s['end'])}\n{s['text']}\n\n")
        f.writelines(lines)

def write_srt(segs, out_path: Path):
    """Write SRT file (optimized with buffered writing)"""
    with out_path.open("w", encoding="utf-8", buffering=8192) as f:
        # Pre-format all segments for better performance
        lines = []
        for i, s in enumerate(segs, 1):
            lines.append(f"{i}\n{fmt_srt(s['start'])} --> {fmt_srt(s['end'])}\n{s['text']}\n\n")
        f.writelines(lines)

def write_text(segs, out_path: Path):
    """Write text file (chỉ text thuần túy, không có format VTT/SRT, không có timestamp)"""
    with out_path.open("w", encoding="utf-8", buffering=8192) as f:
        # Chỉ ghi text, nối liền nhau
        texts = [s['text'].strip() for s in segs if s.get('text', '').strip()]
        f.write(" ".join(texts))
