# GeneratorSub - Tạo phụ đề tiếng Việt tự động

API tạo phụ đề tiếng Việt chất lượng cao từ video/audio sử dụng faster-whisper và AI correction với Gemini.

## 🚀 CÁCH CHẠY PROJECT

### 🐳 Cách 1: Chạy bằng Docker (Khuyến nghị - Dễ nhất)

**Yêu cầu:** Docker và Docker Compose đã được cài đặt

```bash
# 1. Clone hoặc pull project về
# 2. Di chuyển vào thư mục project
cd GeneratorSub

# 3. (Tùy chọn) Tạo file .env nếu muốn cấu hình
# Copy các biến môi trường cần thiết vào file .env
# Ví dụ: GEMINI_API_KEY_1=your_key_here

# 4. Chạy docker-compose
docker-compose up -d

# 5. Xem logs
docker-compose logs -f

# 6. Truy cập API
# API Docs: http://localhost:8000/docs
```

**Các lệnh Docker hữu ích:**
```bash
# Dừng service
docker-compose down

# Dừng và xóa volumes (xóa cả upload và logs)
docker-compose down -v

# Rebuild image (khi có thay đổi code)
docker-compose up -d --build

# Xem logs
docker-compose logs -f gensub

# Vào trong container
docker-compose exec gensub bash
```

**Lưu ý:**
- File upload và logs được lưu trong thư mục `./upload` và `./logs` trên máy host
- Nếu có file `.env`, nó sẽ được mount vào container
- Port mặc định: `8000` (có thể thay đổi trong docker-compose.yml)

---

### 💻 Cách 2: Chạy trực tiếp trên máy

### Bước 1: Cài đặt FFmpeg

**FFmpeg là bắt buộc** (dùng để trích xuất audio từ video, không phải để ghép sub).

- **Windows**: Tải từ https://www.gyan.dev/ffmpeg/builds/ → Giải nén → Thêm vào PATH
- **Linux**: `sudo apt install ffmpeg`
- **macOS**: `brew install ffmpeg`

Kiểm tra: `ffmpeg -version`

### Bước 2: Cài đặt Python dependencies

```bash
# Tạo virtual environment (khuyến nghị)
python -m venv venv

# Kích hoạt virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Cài đặt tất cả packages
pip install -r requirements.txt
```

### Bước 3: Chạy server

```bash
# Windows
py -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Linux/macOS
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Bước 4: Truy cập

- **API Docs**: http://localhost:8000/docs

---

## ⚙️ Cấu hình (Tùy chọn)

Tạo file `.env` trong thư mục gốc để tùy chỉnh:

```env
# Model Whisper (small, medium, large-v2, large-v3)
WHISPER_MODEL=small

# Device: cpu, cuda
DEVICE=cpu

# AI Correction với Gemini (tùy chọn)
GEMINI_API_KEY_1=your_api_key_here
```

Xem thêm các tùy chọn trong file `.env` mẫu hoặc xem phần Troubleshooting bên dưới.

---

## 📋 Yêu cầu hệ thống

- **Python**: 3.8 trở lên
- **FFmpeg**: Bắt buộc (phải có trong PATH)
- **RAM**: Tối thiểu 4GB (khuyến nghị 8GB+)

## 📡 API Endpoints

### POST `/api/gensub`

Tạo phụ đề từ video/audio file.

**Parameters:**
- `file` (file): File video/audio (.mp4, .mkv, .mov, .mp3, ...)
- `fmt` (query, optional): Định dạng phụ đề - `vtt`, `srt`, hoặc `text` (mặc định: `text`)
- `model_name` (query, optional): Override model Whisper (vd: `large-v3`, `medium`, `small`)
- `ai_correct` (query, optional): Bật AI correction với Gemini (cần `GEMINI_API_KEY`)

**Ví dụ:**

```bash
# Tạo phụ đề VTT
curl -X POST "http://localhost:8000/api/gensub?fmt=vtt" \
  -F "file=@video.mp4"

# Tạo phụ đề SRT với AI correction
curl -X POST "http://localhost:8000/api/gensub?fmt=srt&ai_correct=true" \
  -F "file=@video.mp4"

# Tạo phụ đề text thuần túy
curl -X POST "http://localhost:8000/api/gensub?fmt=text" \
  -F "file=@video.mp4"
```

### GET `/api/analyze`

Phân tích chất lượng audio của file.

## ✨ Tính năng

- ✅ **Tự động tối ưu cho tiếng Việt**: Tự động chọn context và prompt phù hợp
- ✅ **Parallel Processing**: Chia video thành chunks và xử lý song song (cho video dài)
- ✅ **AI Correction**: Sử dụng Gemini API để sửa lỗi chính tả và ngữ pháp
- ✅ **Auto Denoise**: Tự động bật/tắt denoise dựa trên chất lượng audio
- ✅ **Auto Channel Selection**: Tự động chọn channel tốt nhất (left/right/mix)
- ✅ **Multiple API Keys**: Hỗ trợ nhiều Gemini API keys để tăng rate limit
- ✅ **Confidence Scores**: Đánh giá độ tin cậy của transcription
- ✅ **Vietnamese Enhancement**: Tự động sửa lỗi phổ biến trong tiếng Việt

## 📁 Cấu trúc thư mục

```
GeneratorSub/
├── app/
│   ├── core/           # Core modules (transcription, audio, config, ...)
│   ├── routes/          # API routes
│   └── main.py         # FastAPI app
├── upload/             # Thư mục lưu file upload và phụ đề
├── logs/               # Log files
├── requirements.txt    # Python dependencies
├── .env               # Environment variables (tùy chọn)
└── README.md          # File này
```

## 🔧 Troubleshooting

### Lỗi "ffmpeg not found"
- Đảm bảo FFmpeg đã được cài đặt và có trong PATH
- Kiểm tra: `ffmpeg -version`

### Lỗi "CUDA out of memory"
- Giảm `PARALLEL_MAX_WORKERS` trong `.env`
- Hoặc dùng model nhỏ hơn (`WHISPER_MODEL=small`)
- Hoặc chuyển sang CPU: `DEVICE=cpu`

### Lỗi "Module not found"
- Đảm bảo đã cài đặt tất cả dependencies: `pip install -r requirements.txt`
- Kiểm tra virtual environment đã được kích hoạt

### Video quá lớn
- Tăng `MAX_FILE_MB` trong `.env` (mặc định: 2048MB = 2GB)

### AI Correction không hoạt động
- Kiểm tra `GEMINI_API_KEY` đã được set trong `.env`
- Kiểm tra API key còn hạn sử dụng
- Xem logs trong thư mục `logs/` để biết chi tiết lỗi

## 📝 Logs

Logs được lưu trong thư mục `logs/` với format: `gensub_YYYYMMDD.log`

## 🎯 Model Whisper khuyến nghị

- **small**: Nhanh, độ chính xác tốt (khuyến nghị cho CPU)
- **medium**: Cân bằng tốc độ và độ chính xác
- **large-v2**: Độ chính xác cao, chậm hơn
- **large-v3**: Độ chính xác cao nhất, chậm nhất (khuyến nghị cho GPU)

## 📄 License

Xem file LICENSE (nếu có)

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request.

---

- **Lưu ý**: Project này sử dụng faster-whisper (CTranslate2) để tăng tốc độ transcription so với Whisper gốc.
- **Author**: Bùi Tiến Quát

