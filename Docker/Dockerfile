# Base image từ Microsoft SQL Server 2019
FROM mcr.microsoft.com/mssql/server:2019-latest

# Metadata
LABEL maintainer="skillup-team@example.com"
LABEL description="SQL Server 2019 Express for SkillUp Learning Platform"
LABEL version="1.0"

# Set environment variables
ENV ACCEPT_EULA=Y
ENV MSSQL_PID=Express

# Create directories for init scripts and backups
USER root
RUN mkdir -p /docker-entrypoint-initdb.d /var/backups && \
    chmod -R 755 /docker-entrypoint-initdb.d /var/backups

# Copy init scripts vào container
COPY init-scripts/*.sql /docker-entrypoint-initdb.d/

# Expose SQL Server port
EXPOSE 1433

# Healthcheck để kiểm tra SQL Server đã sẵn sàng chưa
HEALTHCHECK --interval=10s --timeout=3s --retries=10 --start-period=10s \
    CMD /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P ${MSSQL_SA_PASSWORD} -Q "SELECT 1" || exit 1

# Note: SQL Server sẽ chạy với quyền của user được định nghĩa trong base image
