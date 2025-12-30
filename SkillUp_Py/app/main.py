from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import UPLOAD_DIR
from app.routes.gensub import router as gensub_router

app = FastAPI(
    title="GenSub API (faster-whisper)",
    version="5.0.0",
    description=f"Generate subtitles from video/audio → VTT/SRT/TXT. Upload folder: {UPLOAD_DIR}\nSwagger: /docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

app.include_router(gensub_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
