"""
Load environment variables from .env file
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from project root
project_root = Path(__file__).resolve().parents[2]
env_file = project_root / ".env"

if env_file.exists():
    load_dotenv(env_file)
    try:
        print(f"✓ Loaded environment from: {env_file}")
    except UnicodeEncodeError:
        print(f"[OK] Loaded environment from: {env_file}")
else:
    try:
        print(f"ℹ️  No .env file found at: {env_file}")
        print(f"ℹ️  Using system environment variables or defaults")
    except UnicodeEncodeError:
        print(f"[INFO] No .env file found at: {env_file}")
        print(f"[INFO] Using system environment variables or defaults")

def get_env(key: str, default=None):
    """Get environment variable with fallback"""
    return os.getenv(key, default)
