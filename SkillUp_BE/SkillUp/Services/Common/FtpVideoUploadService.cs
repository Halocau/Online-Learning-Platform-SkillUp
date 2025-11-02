using Microsoft.AspNetCore.Http;
using System.Net;

namespace SkillUp.Services.Common
{
    public class FtpVideoUploadService
    {
        private readonly IConfiguration _configuration;
        private readonly string _ftpHost;
        private readonly int _ftpPort;
        private readonly string _ftpUsername;
        private readonly string _ftpPassword;
        private readonly string _ftpBasePath;
        private readonly string _baseUrl;

        public FtpVideoUploadService(IConfiguration configuration)
        {
            _configuration = configuration;
            _ftpHost = _configuration["FtpSettings:Host"] ?? "";
            _ftpPort = _configuration.GetValue<int>("FtpSettings:Port", 21);
            _ftpUsername = _configuration["FtpSettings:Username"] ?? "";
            _ftpPassword = _configuration["FtpSettings:Password"] ?? "";
            _ftpBasePath = _configuration["FtpSettings:BasePath"] ?? "/video";
            _baseUrl = _configuration["VideoSettings:BaseUrl"] ?? "";
        }

        /// <summary>
        /// Upload video lên VPS qua FTP
        /// </summary>
        /// <param name="file">Video file từ client</param>
        /// <param name="subfolder">Thư mục con (ví dụ: "lessons")</param>
        /// <returns>URL để truy cập video</returns>
        public async Task<string> UploadVideoAsync(IFormFile file, string? subfolder = null)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("Video file không được để trống!");
            }

            // Validate file extension
            var allowedExtensions = new[] { ".mp4", ".avi", ".mov", ".wmv", ".webm", ".mkv" };
            var fileExtension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedExtensions.Contains(fileExtension))
            {
                throw new ArgumentException($"Định dạng video không hợp lệ! Chỉ chấp nhận: {string.Join(", ", allowedExtensions)}");
            }

            // Validate file size (500MB)
            var maxSizeInBytes = _configuration.GetValue<int>("VideoSettings:MaxSizeInMB", 500) * 1024 * 1024;
            if (file.Length > maxSizeInBytes)
            {
                throw new ArgumentException($"Kích thước video không được vượt quá {maxSizeInBytes / 1024 / 1024}MB!");
            }

            // Tạo tên file unique
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";

            // Xác định đường dẫn FTP
            var ftpPath = _ftpBasePath;
            if (!string.IsNullOrEmpty(subfolder))
            {
                ftpPath = $"{_ftpBasePath}/{subfolder}";
                // Tạo thư mục nếu chưa tồn tại
                await CreateFtpDirectoryIfNotExists(ftpPath);
            }

            var ftpFullPath = _ftpPort == 21
                ? $"ftp://{_ftpHost}{ftpPath}/{uniqueFileName}"
                : $"ftp://{_ftpHost}:{_ftpPort}{ftpPath}/{uniqueFileName}";

            try
            {
                // Upload file lên FTP
                var request = (FtpWebRequest)WebRequest.Create(ftpFullPath);
                request.Method = WebRequestMethods.Ftp.UploadFile;
                request.Credentials = new NetworkCredential(_ftpUsername, _ftpPassword);
                request.UsePassive = true;
                request.UseBinary = true;
                request.KeepAlive = false;
                request.Timeout = 60000; // 60 seconds

                // Copy file stream to FTP
                using (var fileStream = file.OpenReadStream())
                using (var ftpStream = request.GetRequestStream())
                {
                    await fileStream.CopyToAsync(ftpStream);
                }

                // Get response
                using (var response = (FtpWebResponse)request.GetResponse())
                {
                    if (response.StatusCode != FtpStatusCode.ClosingData &&
                        response.StatusCode != FtpStatusCode.FileActionOK)
                    {
                        throw new Exception($"FTP upload failed: {response.StatusDescription}");
                    }
                }

                // Trả về URL để truy cập video
                var relativeFolder = subfolder != null ? $"/{subfolder}" : "";
                var videoUrl = $"{_baseUrl}/resources/videos{relativeFolder}/{uniqueFileName}";

                return videoUrl;
            }
            catch (WebException ex)
            {
                var errorMessage = "Lỗi khi upload video lên VPS";
                if (ex.Response != null)
                {
                    var response = (FtpWebResponse)ex.Response;
                    errorMessage += $": {response.StatusDescription}";
                }
                else
                {
                    errorMessage += $": {ex.Message}";
                }
                throw new Exception(errorMessage, ex);
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi upload video lên VPS: {ex.Message}", ex);
            }
        }

        /// <summary>
        /// Xóa video từ VPS qua FTP
        /// </summary>
        /// <param name="videoUrl">URL của video cần xóa</param>
        /// <returns>True nếu xóa thành công</returns>
        public async Task<bool> DeleteVideoAsync(string videoUrl)
        {
            try
            {
                if (string.IsNullOrEmpty(videoUrl))
                    return false;

                // Parse URL to get file path
                var uri = new Uri(videoUrl);
                var pathParts = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);

                // Tìm index của "videos" trong path
                var videosIndex = Array.FindIndex(pathParts, p => p == "videos");
                if (videosIndex == -1)
                    return false;

                // Lấy phần path sau "videos"
                var relativePath = string.Join("/", pathParts.Skip(videosIndex + 1));
                var ftpFullPath = $"ftp://{_ftpHost}{_ftpBasePath}/{relativePath}";

                var request = (FtpWebRequest)WebRequest.Create(ftpFullPath);
                request.Method = WebRequestMethods.Ftp.DeleteFile;
                request.Credentials = new NetworkCredential(_ftpUsername, _ftpPassword);

                using (var response = (FtpWebResponse)await request.GetResponseAsync())
                {
                    return response.StatusCode == FtpStatusCode.FileActionOK;
                }
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Tạo thư mục trên FTP nếu chưa tồn tại
        /// </summary>
        private async Task CreateFtpDirectoryIfNotExists(string directoryPath)
        {
            try
            {
                var ftpFullPath = _ftpPort == 21
                    ? $"ftp://{_ftpHost}{directoryPath}"
                    : $"ftp://{_ftpHost}:{_ftpPort}{directoryPath}";

                var request = (FtpWebRequest)WebRequest.Create(ftpFullPath);
                request.Method = WebRequestMethods.Ftp.MakeDirectory;
                request.Credentials = new NetworkCredential(_ftpUsername, _ftpPassword);
                request.Timeout = 30000; // 30 seconds

                using (var response = (FtpWebResponse)await request.GetResponseAsync())
                {
                    // Directory created successfully
                }
            }
            catch (WebException ex)
            {
                // Nếu thư mục đã tồn tại thì bỏ qua
                if (ex.Response is FtpWebResponse response)
                {
                    if (response.StatusCode == FtpStatusCode.ActionNotTakenFileUnavailable)
                    {
                        // Directory already exists, ignore
                        return;
                    }
                }
                // Ignore other errors (directory might already exist)
            }
        }

        /// <summary>
        /// Test kết nối FTP với thông tin chi tiết
        /// </summary>
        public async Task<(bool success, string message, string details)> TestConnectionDetailedAsync()
        {
            try
            {
                var ftpFullPath = _ftpPort == 21
                    ? $"ftp://{_ftpHost}{_ftpBasePath}"
                    : $"ftp://{_ftpHost}:{_ftpPort}{_ftpBasePath}";

                var details = $"Testing FTP: {ftpFullPath}\n" +
                             $"Username: {_ftpUsername}\n" +
                             $"Port: {_ftpPort}\n" +
                             $"BasePath: {_ftpBasePath}";

                var request = (FtpWebRequest)WebRequest.Create(ftpFullPath);
                request.Method = WebRequestMethods.Ftp.ListDirectory;
                request.Credentials = new NetworkCredential(_ftpUsername, _ftpPassword);
                request.UsePassive = true;
                request.UseBinary = true;
                request.KeepAlive = false;
                request.Timeout = 10000; // 10 seconds

                using (var response = (FtpWebResponse)await request.GetResponseAsync())
                {
                    var statusMessage = $"Connected! Status: {response.StatusDescription}";
                    return (true, statusMessage, details);
                }
            }
            catch (WebException ex)
            {
                var errorMessage = "WebException: ";
                if (ex.Response != null)
                {
                    var response = (FtpWebResponse)ex.Response;
                    errorMessage += $"{response.StatusDescription} (Code: {response.StatusCode})";
                }
                else if (ex.InnerException != null)
                {
                    errorMessage += ex.InnerException.Message;
                }
                else
                {
                    errorMessage += ex.Message;
                }

                var details = $"FTP URL: ftp://{_ftpHost}:{_ftpPort}{_ftpBasePath}\n" +
                             $"Username: {_ftpUsername}\n" +
                             $"Error Type: {ex.Status}\n" +
                             $"Full Error: {ex.ToString()}";

                return (false, errorMessage, details);
            }
            catch (Exception ex)
            {
                var details = $"FTP URL: ftp://{_ftpHost}:{_ftpPort}{_ftpBasePath}\n" +
                             $"Exception Type: {ex.GetType().Name}\n" +
                             $"Full Error: {ex.ToString()}";
                return (false, ex.Message, details);
            }
        }

        /// <summary>
        /// Test kết nối FTP
        /// </summary>
        public async Task<bool> TestConnectionAsync()
        {
            var result = await TestConnectionDetailedAsync();
            return result.success;
        }
    }
}
