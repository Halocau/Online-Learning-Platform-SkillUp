# 🚀 Hướng dẫn Sử dụng Nhanh - SkillUp Database

## Cách 1: Sử dụng Docker Run (Nhanh nhất - 1 lệnh)

```powershell
docker run -d --name mssqlserver -p 1435:1433 -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=Pass@123" -e "MSSQL_PID=Express" -v sqlserver_data:/var/opt/mssql quatbt/skillup-mssql:latest
```

**Thông tin kết nối:**
- Server: `localhost,1435`
- Username: `sa`
- Password: `Pass@123`
- Database: `SkillUp` (được tạo tự động)

---

## Cách 2: Sử dụng Docker Compose (Khuyến nghị)

### Bước 1: Tạo thư mục và các file cần thiết

```powershell
# Tạo thư mục
mkdir skillup-database
cd skillup-database

# Tạo file .env
@"
MSSQL_SA_PASSWORD=Pass@123
MSSQL_DATABASE=SkillUp
MSSQL_PORT=1435
"@ | Out-File -FilePath .env -Encoding UTF8

# Tạo file docker-compose.yaml
@"
version: '3.8'

services:
  db:
    image: 'quatbt/skillup-mssql:latest'
    restart: always
    container_name: mssqlserver
    environment:
      MSSQL_SA_PASSWORD: `${MSSQL_SA_PASSWORD}
      ACCEPT_EULA: 'Y'
      MSSQL_PID: 'Express'
    ports:
      - '`${MSSQL_PORT}:1433'
    volumes:
      - sqlserver_data:/var/opt/mssql
    networks:
      - skillup-network

volumes:
  sqlserver_data:
    driver: local

networks:
  skillup-network:
    driver: bridge
"@ | Out-File -FilePath docker-compose.yaml -Encoding UTF8
```

### Bước 2: Chạy container

```powershell
docker-compose up -d
```

### Bước 3: Kiểm tra trạng thái

```powershell
docker ps
docker logs mssqlserver
```

---

## 📊 Kết nối Database

### Sử dụng SQL Server Management Studio (SSMS)
1. Mở SSMS
2. Server name: `localhost,1435`
3. Authentication: SQL Server Authentication
4. Login: `sa`
5. Password: `Pass@123`


### Sử dụng VS Code (với SQL Server Extension)
1. Cài extension: `SQL Server (mssql)`
2. Tạo connection mới
3. Server name: `localhost,1435`
4. Username: `sa`
5. Password: `Pass@123`

### Sử dụng Command Line

```powershell
# Vào container và chạy sqlcmd
docker exec -it mssqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Pass@123

# Sau đó chạy các lệnh SQL
1> SELECT name FROM sys.databases;
2> GO
1> USE SkillUp;
2> GO
```

---

## 🛠️ Các lệnh hữu ích

```powershell
# Xem danh sách containers
docker ps

# Xem logs
docker logs mssqlserver

# Xem logs real-time
docker logs -f mssqlserver

# Dừng container
docker stop mssqlserver

# Khởi động lại container
docker restart mssqlserver

# Xóa container (cẩn thận!)
docker rm -f mssqlserver

# Xóa container và volume (mất dữ liệu!)
docker-compose down -v
```

---

## 🔧 Troubleshooting

### Container không khởi động
```powershell
# Xem logs để biết lỗi
docker logs mssqlserver

# Kiểm tra port có bị chiếm chưa
netstat -ano | findstr :1435

# Thử dừng và chạy lại
docker-compose down
docker-compose up -d
```

### Không kết nối được database
```powershell
# Đợi 10-30 giây sau khi khởi động container
# Kiểm tra health check
docker inspect mssqlserver | findstr Health

# Kiểm tra xem SQL Server đã sẵn sàng chưa
docker exec mssqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Pass@123 -Q "SELECT 1"
```

### Quên mật khẩu SA
- Mật khẩu mặc định: `Pass@123`
- Để đổi mật khẩu, sửa file `.env` và chạy lại `docker-compose up -d`

---

## 📦 Thông tin Image

- **Docker Hub**: https://hub.docker.com/r/quatbt/skillup-mssql
- **Tags**: `latest`, `v1.0`
- **Size**: ~1.49GB
- **Base Image**: SQL Server 2019 Express Edition
- **Platform**: Linux/amd64

---

## 🔗 Links hữu ích

- **Repository**: https://github.com/Halocau/Online-Learning-Platform-SkillUp
- **Docker Hub**: https://hub.docker.com/r/quatbt/skillup-mssql
- **SQL Server Docs**: https://docs.microsoft.com/en-us/sql/

---

## ⚠️ Lưu ý

- Mật khẩu `Pass@123` chỉ dùng cho development, không dùng cho production
- Dữ liệu được lưu trong Docker volume, không mất khi restart container
- Để backup dữ liệu, sử dụng các công cụ backup của SQL Server
- Port mặc định: 1435 (có thể thay đổi trong file `.env`)
