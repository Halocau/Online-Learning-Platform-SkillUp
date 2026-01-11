# SkillUp - Online Learning Platform 🎓

Nền tảng học trực tuyến thông minh với AI hỗ trợ học tập cá nhân hóa.

## ✨ Chức năng chính

### 🎥 Quản lý khóa học & Video

- Tạo và quản lý khóa học, bài học
- Upload video bài giảng
- **Tự động tạo phụ đề** bằng AI Whisper

### 🤖 Chat AI - Trợ lý học tập thông minh (RAG)

- **Hỏi đáp về nội dung bài học** - AI trả lời dựa trên video đã xem
- Sử dụng công nghệ RAG (Retrieval-Augmented Generation)
- Tìm kiếm semantic trong phụ đề với Qdrant Vector DB
- Powered by Gemini AI - Trả lời chính xác, có ngữ cảnh

### 👥 Tương tác & Cộng đồng

- Forum thảo luận theo chủ đề
- Comment và đánh giá khóa học
- Chat realtime với SignalR
- Báo cáo vi phạm nội dung

### 💳 Thanh toán & Giỏ hàng

- Mua khóa học qua PayOS
- Quản lý giỏ hàng
- Lịch sử giao dịch

### 📊 Dashboard & Quản trị

- **Học viên**: Theo dõi tiến độ, khóa học đã mua
- **Giảng viên**: Quản lý khóa học, doanh thu, thống kê
- **Admin**: Kiểm duyệt nội dung, quản lý người dùng

### 🔐 Xác thực & Bảo mật

- Đăng ký/Đăng nhập email
- Đăng nhập Google OAuth
- JWT Authentication

---

## 🏗️ Công nghệ sử dụng

| Component       | Technology                  |
| --------------- | --------------------------- |
| **Backend API** | .NET Core 8, SignalR        |
| **Frontend**    | React, Vite, TailwindCSS    |
| **AI Service**  | Python, FastAPI, Whisper AI |
| **Chat AI**     | Gemini AI, RAG Architecture |
| **Vector DB**   | Qdrant Cloud                |
| **Database**    | SQL Server                  |
| **Storage**     | Cloudinary, FTP             |
| **Payment**     | PayOS                       |

---

## 🚀 Hướng dẫn chạy nhanh

### 📋 Yêu cầu

- Docker Desktop (khuyến nghị) HOẶC .NET 8 + Node.js 18 + Python 3.9
- SQL Server (Docker tự động cài)
- 4GB RAM, 10GB dung lượng

### ⚡ Chạy bằng Docker (Khuyến nghị)

```bash
# 1. Clone project
git clone <repository-url>
cd Online-Learning-Platform-SkillUp

# 2. Cấu hình appsettings.json (Xem phần bên dưới)
# Điền: ConnectionStrings, Gemini API, Qdrant, Cloudinary, PayOS

# 3. Chạy tất cả services
docker-compose up -d

# 4. Chờ 30s và import database
timeout 30
docker exec -i mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Skillup@490" -Q "CREATE DATABASE SkillUp"
docker exec -i mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "Skillup@490" -d SkillUp < SkillUp.sql

# 5. Chạy Frontend
cd SkillUp_FE
npm install
npm run dev
```

**Truy cập:**

- Frontend: http://localhost:5173
- Backend API: http://localhost:5120/swagger
- Python Service: http://localhost:8000/docs

### 🛑 Dừng services

```bash
docker-compose down
```

---

## ⚙️ Cấu hình quan trọng

### 🔑 API Keys cần có

Trước khi chạy, cần đăng ký và lấy các API keys sau:

1. **Gemini AI** (REQUIRED - Cho Chat AI)

   - 🔗 https://aistudio.google.com/app/apikey
   - Free: 10 requests/minute

2. **Qdrant Vector DB** (REQUIRED - Cho RAG)

   - 🔗 https://cloud.qdrant.io
   - Free tier: 1GB
   - Tạo Collection: `skillup_subtitles`, Vector size: `3072`

3. **Cloudinary** (Upload ảnh)

   - 🔗 https://cloudinary.com

4. **PayOS** (Thanh toán)

   - 🔗 https://payos.vn

5. **Gmail App Password** (Gửi email)
   - 🔗 https://myaccount.google.com/apppasswords

### 📝 File appsettings.json

Chỉnh sửa `SkillUp_BE/SkillUp/appsettings.json`:



<details>
<summary>Click để xem chi tiết</summary>

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",

  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost,1433;Database=SkillUp;User Id=sa;Password=Skillup@490;Encrypt=False"
  },

  "JwtSettings": {
    "SecretKey": "YourSuperSecretKeyForJwtTokenGeneration12345",
    "Issuer": "SkillUp",
    "Audience": "SkillUpUsers",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 7
  },

  "Email": {
    "From": "your-email@gmail.com",
    "Smtp": "smtp.gmail.com",
    "Port": "587",
    "Password": "your-gmail-app-password"
  },

  "PayOS": {
    "ClientId": "your-payos-client-id",
    "ApiKey": "your-payos-api-key",
    "ChecksumKey": "your-payos-checksum-key"
  },

  "GoogleAuth": {
    "ClientId": "your-google-oauth-client-id.apps.googleusercontent.com",
    "ClientSecret": "your-google-oauth-secret"
  },

  "CloudinarySettings": {
    "CloudName": "your-cloudinary-name",
    "ApiKey": "your-cloudinary-key",
    "ApiSecret": "your-cloudinary-secret"
  },

  "VideoSettings": {
    "BaseUrl": "http://localhost:5120",
    "MaxSizeInMB": 100
  },

  "FtpSettings": {
    "Host": "your-ftp-host",
    "Port": 21,
    "Username": "your-ftp-username",
    "Password": "your-ftp-password",
    "BasePath": "/video"
  },

  "GenSub": {
    "BaseUrl": "http://gensub:8000",
    "DefaultFormat": "text",
    "AiCorrection": true,
    "RequestTimeoutSeconds": 1800
  },

  "Gemini": {
    "ApiKey": "YOUR_GEMINI_API_KEY",
    "ApiKeys": ["YOUR_GEMINI_API_KEY_1", "YOUR_GEMINI_API_KEY_2"],
    "EmbeddingModel": "gemini-embedding-001",
    "ChatModel": "gemini-2.5-flash",
    "Temperature": 0.7,
    "MaxOutputTokens": 32768,
    "TopP": 0.9
  },

  "Ollama": {
    "BaseUrl": "http://localhost:11434",
    "ChatModel": "ontocord/vinallama",
    "EmbeddingModel": "nomic-embed-text",
    "Temperature": 0.7,
    "TopP": 0.9,
    "MaxTokens": 2000
  },

  "Qdrant": {
    "Endpoint": "https://your-cluster-id.gcp.cloud.qdrant.io",
    "ApiKey": "YOUR_QDRANT_API_KEY",
    "Collection": "skillup_subtitles",
    "DefaultVectorSize": 3072
  },

  "Rag": {
    "ChunkSize": 800,
    "ChunkOverlap": 120,
    "TopK": 5
  },

  "EPPlus": {
    "ExcelPackage": {
      "LicenseContext": "NonCommercial"
    }
  },

  "BackendUrl": "http://localhost:5120",
  "FrontendUrl": "http://localhost:5173",

  "AllowedOrigins": ["http://localhost:5173", "http://localhost:3000"]
}
```

</details>

---

## 🛠️ Chạy thủ công (Development)

### Backend (.NET)

```bash
cd SkillUp_BE/SkillUp
dotnet restore
dotnet run
# → http://localhost:5120
```

### Frontend (React)

```bash
cd SkillUp_FE
npm install
npm run dev
# → http://localhost:5173
```

### Python Service

```bash
cd SkillUp_Py
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000
```

---

## 📊 Ports sử dụng

| Service     | Port | URL                           |
| ----------- | ---- | ----------------------------- |
| Frontend    | 5173 | http://localhost:5173         |
| Backend API | 5120 | http://localhost:5120/swagger |
| Python AI   | 8000 | http://localhost:8000/docs    |
| SQL Server  | 1433 | localhost,1433                |

---

---

## 🎯 Tài khoản demo

Sau khi import database:

- Admin: admin@skillup.com / Admin@123
- Giảng viên: lecturer@skillup.com / Lecturer@123
- Học viên: student@skillup.com / Student@123

---

## 📚 Tài liệu API

- Backend: http://localhost:5120/swagger
- Python Service: http://localhost:8000/docs

---

## 📂 Cấu trúc project

```
SkillUp/
├── docker-compose.yml       # Docker config
├── SkillUp.sql             # Database schema
├── SkillUp_BE/             # .NET Backend
│   └── SkillUp/
│       ├── Controllers/    # API endpoints
│       ├── Services/       # Business logic
│       └── Repositories/   # Data access
├── SkillUp_FE/             # React Frontend
│   └── src/
│       ├── pages/          # UI pages
│       ├── components/     # Reusable components
│       └── api/            # API calls
└── SkillUp_Py/             # Python AI Service
    └── app/
        ├── main.py         # FastAPI entry
        └── routes/         # API routes
```

---

**Chúc bạn thành công! 🚀**

Made with ❤️ by SkillUp Team
