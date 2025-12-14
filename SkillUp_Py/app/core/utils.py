import re, uuid
from pathlib import Path

def secure_stem(name: str) -> str:
    stem = re.sub(r"[^\w.-]+", "_", Path(name).stem).strip("._") or "upload"
    return f"{stem}_{uuid.uuid4().hex[:8]}"

