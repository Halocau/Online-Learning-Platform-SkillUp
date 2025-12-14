# 🐳 Hướng dẫn chạy GeneratorSub bằng Docker

## Yêu cầu

- Docker đã được cài đặt
- Docker Compose đã được cài đặt (thường đi kèm với Docker Desktop)

## Cách sử dụng

### 1. Chạy lần đầu

```bash
# Pull code về (hoặc clone từ git)
cd GeneratorSub

# Chạy docker-compose
docker-compose up -d
```

### 2. Kiểm tra service đang chạy

```bash
# Xem logs
docker-compose logs -f

# Hoặc kiểm tra container
docker ps
```

### 3. Truy cập API

- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

### 4. Cấu hình (Tùy chọn)

Tạo file `.env` trong thư mục gốc để cấu hình:

```env
# Model Whisper
WHISPER_MODEL=small

# Device
DEVICE=cpu

# Gemini API Key (nếu dùng AI Correction)
GEMINI_API_KEY_1=your_api_key_here

# Các cấu hình khác...
```

Sau khi tạo `.env`, restart container:

```bash
docker-compose restart
```

## Các lệnh thường dùng

```bash
# Dừng service
docker-compose down

# Dừng và xóa volumes (xóa cả dữ liệu upload và logs)
docker-compose down -v

# Rebuild image (khi có thay đổi code)
docker-compose up -d --build

# Xem logs real-time
docker-compose logs -f gensub

# Xem logs của 100 dòng cuối
docker-compose logs --tail=100 gensub

# Vào trong container để debug
docker-compose exec gensub bash

# Restart service
docker-compose restart
```

## Cấu trúc thư mục

```
GeneratorSub/
├── docker-compose.yml    # File cấu hình Docker Compose
├── Dockerfile            # File build Docker image
├── .env                  # File cấu hình (tùy chọn)
├── upload/               # Thư mục lưu file upload (được mount từ container)
├── logs/                 # Thư mục lưu logs (được mount từ container)
└── app/                  # Source code
```

## Troubleshooting

### Container không start được

```bash
# Xem logs để biết lỗi
docker-compose logs gensub

# Kiểm tra xem port 8000 đã bị chiếm chưa
# Windows: netstat -ano | findstr :8000
# Linux/Mac: lsof -i :8000
```

### Muốn đổi port

Sửa file `docker-compose.yml`, thay đổi dòng:
```yaml
ports:
  - "8000:8000"  # Đổi số đầu tiên thành port bạn muốn, ví dụ: "9000:8000"
```

### Muốn xóa hết và chạy lại từ đầu

```bash
# Dừng và xóa container, image, volumes
docker-compose down -v --rmi all

# Chạy lại
docker-compose up -d --build
```

### Kiểm tra healthcheck

```bash
# Healthcheck tự động chạy mỗi 30 giây
# Có thể test thủ công:
docker-compose exec gensub curl http://localhost:8000/api/health
```

## Lưu ý

- File upload và logs được lưu trên máy host trong thư mục `./upload` và `./logs`
- Khi xóa container, dữ liệu trong `upload` và `logs` vẫn còn (trừ khi dùng `docker-compose down -v`)
- Model Whisper sẽ được tải về lần đầu khi chạy (có thể mất vài phút)
- Nếu dùng GPU, cần cài đặt nvidia-docker và sửa docker-compose.yml để hỗ trợ GPU

