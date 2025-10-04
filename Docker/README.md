# Dự án Docker Database cho SkillUp

Dự án này thiết lập cơ sở dữ liệu SQL Server sử dụng Docker. Bao gồm tất cả các cấu hình và script cần thiết để khởi tạo và quản lý database một cách hiệu quả.

**Docker Hub**: [quatbt/skillup-mssql](https://hub.docker.com/r/quatbt/skillup-mssql)

## 🚀 Cách sử dụng nhanh (Không cần clone repository)

Nếu bạn chỉ muốn chạy database mà không cần toàn bộ source code:

### Cách 1: Sử dụng Docker Run (Đơn giản nhất)

```powershell
# Pull và chạy container
docker run -d \
  --name mssqlserver \
  -p 1435:1433 \
  -e "ACCEPT_EULA=Y" \
  -e "MSSQL_SA_PASSWORD=Pass@123" \
  -e "MSSQL_PID=Express" \
  -v sqlserver_data:/var/opt/mssql \
  quatbt/skillup-mssql:latest
```

### Cách 2: Sử dụng Docker Compose (Khuyến nghị)

1. **Tạo thư mục mới cho project:**
```powershell
mkdir skillup-database
cd skillup-database
```

2. **Tạo file `.env`:**
```env
MSSQL_SA_PASSWORD=Pass@123
MSSQL_DATABASE=SkillUp
MSSQL_PORT=1435
```

3. **Tạo file `docker-compose.yaml`:**
```yaml
version: '3.8'

services:
  db:
    image: "quatbt/skillup-mssql:latest"
    restart: always
    container_name: mssqlserver
    environment:
      MSSQL_SA_PASSWORD: ${MSSQL_SA_PASSWORD}
      ACCEPT_EULA: "Y"
      MSSQL_PID: "Express"
    ports:
      - "${MSSQL_PORT}:1433"
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
```

4. **Chạy container:**
```powershell
docker-compose up -d
```

## 📋 Cách cài đặt đầy đủ (Clone repository)

## Cấu trúc dự án

- **docker-compose.yaml**: Định nghĩa các services, networks và volumes cho ứng dụng Docker. Chỉ định service database SQL Server, bao gồm image, biến môi trường và ánh xạ port.

- **Dockerfile**: File để build custom Docker image với SQL Server 2019 và init scripts.
  
- **init-scripts/init.sql**: Chứa các lệnh SQL để khởi tạo database khi container được khởi động. Hiện tại chỉ tạo database trống `SkillUp`, các bảng sẽ được thêm bằng tool khác.

- **backups/**: Thư mục dùng để lưu trữ các file backup của database. Sử dụng để giữ các bản snapshot của database tại các thời điểm khác nhau.

- **.env**: Chứa các biến môi trường được sử dụng trong file docker-compose.yaml. Giúp quản lý thông tin nhạy cảm như mật khẩu và tên database mà không cần hardcode.

- **.dockerignore**: Chỉ định các file và thư mục nào sẽ bị Docker bỏ qua khi build image. Giúp giảm kích thước image và tránh bao gồm các file không cần thiết.

## Hướng dẫn cài đặt

1. Đảm bảo máy tính của bạn đã cài đặt Docker và Docker Compose.
2. Clone repository này:
   ```powershell
   git clone https://github.com/Halocau/Online-Learning-Platform-SkillUp.git
   cd Online-Learning-Platform-SkillUp/SkillUp/Docker
   ```
3. File `.env` đã được tạo sẵn với các biến môi trường cần thiết:
   - `MSSQL_SA_PASSWORD=Pass@123`
   - `MSSQL_DATABASE=SkillUp`
   - `MSSQL_PORT=1435`
4. Chạy lệnh `docker-compose up -d` để khởi động SQL Server container.
5. Database `SkillUp` sẽ được tạo tự động, bạn có thể sử dụng tool khác để tạo bảng và thêm dữ liệu.

## Hướng dẫn sử dụng

### Kết nối Database
Để truy cập SQL Server database, sử dụng thông tin sau:
- **Server**: `localhost,1435` hoặc `localhost:1435`
- **Username**: `sa`
- **Password**: `Pass@123`
- **Database**: `SkillUp`

### Các lệnh Docker hữu ích

```powershell
# Khởi động container
docker-compose up -d

# Dừng container
docker-compose down

# Xem logs
docker logs mssqlserver

# Xem trạng thái container
docker ps

# Vào container để chạy lệnh SQL
docker exec -it mssqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P Pass@123

# Xóa container và volumes (cẩn thận: sẽ mất dữ liệu!)
docker-compose down -v
```

### Backup và Restore

- Sử dụng thư mục `backups` để lưu trữ các file backup database.
- File backup có thể được truy cập từ container tại đường dẫn `/var/backups`.

### Tạo bảng và dữ liệu

Sau khi container đã chạy, bạn có thể sử dụng các tool sau để quản lý database:
- **SQL Server Management Studio (SSMS)**
- **Azure Data Studio**
- **DBeaver**
- **Visual Studio Code** với extension SQL Server
- Hoặc **Entity Framework Core** migrations từ ứng dụng ASP.NET Core

## Thông tin bổ sung

### Cấu hình quan trọng

- **Version**: SQL Server 2019 Express Edition
- **Port**: 1435 (host) → 1433 (container)
- **Persistent Storage**: Dữ liệu được lưu trữ trong volume `sqlserver_data`
- **Network**: `skillup-network` (bridge mode)
- **Health Check**: Tự động kiểm tra kết nối database mỗi 10 giây

### Lưu ý

- Mật khẩu `Pass@123` chỉ dùng cho môi trường development. Với production, nên dùng mật khẩu phức tạp hơn.
- Dữ liệu database được lưu persistent trong volume, không bị mất khi restart container.
- Để thay đổi cấu hình, chỉnh sửa file `.env` và chạy lại `docker-compose up -d`.

### Xử lý sự cố

**Container không khởi động được:**
- Kiểm tra port 1435 đã bị sử dụng chưa
- Xem logs: `docker logs mssqlserver`
- Đảm bảo Docker Desktop đang chạy

**Không kết nối được database:**
- Đợi 10-30 giây sau khi khởi động container
- Kiểm tra container đang chạy: `docker ps`
- Kiểm tra health check: `docker inspect mssqlserver`

## Đóng góp

Mọi vấn đề hoặc đóng góp, vui lòng tạo issue hoặc liên hệ với người quản lý dự án.