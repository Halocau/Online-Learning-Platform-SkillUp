using CloudinaryDotNet;
using SkillUp.BussinessObjects.DTOs.LecturerApplication;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Implementations;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;
using SkillUp.Services.Interfaces;
using System.Data.Common;

namespace SkillUp.Services.Implementations
{
    public class LecturerApplicationService : ILecturerApplicationService
    {
        private readonly ILecturerApplicationRepository _lecturerApplicationRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly CloudinaryService _cloudinaryService;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILecturerService _lecturerService;
        private readonly IEmailService _emailService;

        public LecturerApplicationService(ILecturerApplicationRepository lecturerApplicationRepository, IAccountRepository accountRepository, CloudinaryService cloudinaryService, ICurrentUserService currentUserService, ILecturerService lecturerService, IEmailService emailService)
        {
            _lecturerApplicationRepository = lecturerApplicationRepository;
            _accountRepository = accountRepository;
            _cloudinaryService = cloudinaryService;
            _currentUserService = currentUserService;
            _lecturerService = lecturerService;
            _emailService = emailService;
        }

        public async Task<bool> ApplyCvAsync(Guid accountId, ApplyCvRequestDto request)
        {
            // Check if user is a lecturer (roleId = 4)
            var account = await _accountRepository.GetByIdAsync(accountId);
            if (account == null || account.RoleId != 4)
            {
                return false;
            }

            // Upload CV file to Cloudinary
            var cvUrl = await _cloudinaryService.UploadPdfAsync(request.CvFile, "skillup/lecturers/cv");

            // Upload nhiều ảnh Degree lên Cloudinary
            var degreeUrls = new List<string>();
            foreach (var degreeFile in request.DegreeFile)
            {
                var degreeUrl = await _cloudinaryService.UploadImageAsync(degreeFile, "skillup/lecturers/degrees");
                degreeUrls.Add(degreeUrl);
            }

            var application = new LecturerApplication
            {
                Id = Guid.NewGuid(),
                AccountId = accountId,
                Cv = cvUrl,
                Degree = string.Join(",", degreeUrls),
                Description = request.Description,
                Title = request.Title,
                Profession = request.Profession,
                Status = "Pending",
                CreatedAt = DateTime.Now
            };

            var result = await _lecturerApplicationRepository.AddAsync(application);
            return result != null && await _lecturerApplicationRepository.SaveChangesAsync();
        }

        public async Task<List<LecturerApplicationResponseDto>> GetMyApplicationsAsync(Guid accountId)
        {
            // Check if user is a lecturer (roleId = 4)
            var account = await _accountRepository.GetByIdAsync(accountId);
            if (account == null || account.RoleId != 4)
            {
                return new List<LecturerApplicationResponseDto>();
            }

            var applications = await _lecturerApplicationRepository.GetAllByAccountIdAsync(accountId);

            return applications.Select(app => new LecturerApplicationResponseDto
            {
                Cv = app.Cv ?? string.Empty,
                Degree = app.Degree ?? string.Empty,
                Title = app.Title ?? string.Empty,
                Profession = app.Profession ?? string.Empty,
                Description = app.Description,
                Status = app.Status,
                RejectReason = app.Reason,
                CreatedAt = app.CreatedAt,
                UpdatedAt = null // Sẽ thêm sau khi update database
            }).OrderByDescending(x => x.CreatedAt).ToList();
        }

        public async Task<bool> UpdateApplicationAsync(Guid accountId, Guid applicationId, UpdateCvRequestDto request)
        {
            // Check if user is a lecturer (roleId = 4)
            var account = await _accountRepository.GetByIdAsync(accountId);
            if (account == null || account.RoleId != 4)
            {
                return false;
            }

            var application = await _lecturerApplicationRepository.GetByIdAsync(applicationId);

            if (application == null || application.AccountId != accountId)
                return false;

            // Only allow update if status is Pending or Rejected
            if (application.Status != "Pending" && application.Status != "Rejected")
                return false;

            // Update CV file if provided
            if (request.CvFile != null)
            {
                var cvUrl = await _cloudinaryService.UploadPdfAsync(request.CvFile, "skillup/lecturers/cv");
                application.Cv = cvUrl;
            }

            // Update Degree file if provided
            if (request.DegreeFile != null)
            {
                var degreeUrl = await _cloudinaryService.UploadImageAsync(request.DegreeFile, "skillup/lecturers/degrees");
                application.Degree = degreeUrl;
            }

            // Update other fields if provided
            if (!string.IsNullOrEmpty(request.Title))
                application.Title = request.Title;

            if (!string.IsNullOrEmpty(request.Profession))
                application.Profession = request.Profession;

            if (request.Description != null)
                application.Description = request.Description;

            // Reset status to Pending if was Rejected
            if (application.Status == "Rejected")
            {
                application.Status = "Pending";
                application.Reason = null;
            }

            await _lecturerApplicationRepository.UpdateAsync(application);
            return await _lecturerApplicationRepository.SaveChangesAsync();
        }

        public async Task<LecturerApplicationResponseDto?> GetApplicationByIdAsync(Guid applicationId)
        {
            var application = await _lecturerApplicationRepository.GetByIdAsync(applicationId);

            if (application == null)
                return null;

            return new LecturerApplicationResponseDto
            {
                Cv = application.Cv ?? string.Empty,
                Degree = application.Degree ?? string.Empty,
                Title = application.Title ?? string.Empty,
                Profession = application.Profession ?? string.Empty,
                Description = application.Description,
                Status = application.Status,
                RejectReason = application.Reason,
                CreatedAt = application.CreatedAt,
                UpdatedAt = null
            };
        }

        public async Task<bool> UpdateStatusAsync(Guid applicationId, UpdateStatusRequestDto request)
        {
            // 1) Kiểm tra user hiện tại
            var userId = _currentUserService.UserId;
            if (userId == null) return false;

            // 2) Lấy application
            var application = await _lecturerApplicationRepository.GetByIdAsync(applicationId);
            if (application == null) return false;

            // 3) Cập nhật trạng thái application
            var updateResult = await _lecturerApplicationRepository.UpdateStatusAsync(
                applicationId, request.Status, request.Reason
            );
            if (updateResult == null || !await _lecturerApplicationRepository.SaveChangesAsync())
                return false;

            // 4) Accepted → tạo Lecturer nếu CHƯA tồn tại, đồng thời cập nhật Account = Active
            if (request.Status == true)
            {
                if (!application.AccountId.HasValue) return false;

                // ⚠️ Kiểm tra tồn tại lecturer theo AccountId
                var existLecturer = await _lecturerService.GetLecturerByAccountIdAsync(application.AccountId.Value);
                if (existLecturer == null)
                {
                    var newLecturer = new Lecturer
                    {
                        Id = Guid.NewGuid(),
                        AccountId = application.AccountId.Value,
                        Title = application.Title,
                        Profession = application.Profession
                    };

                    var created = await _lecturerService.CreateLecturerAsync(newLecturer);
                    if (!created) return false;

                }
                // Nếu đã tồn tại thì bỏ qua tạo mới (có thể cập nhật Title/Profession nếu cần)

                var account = await _accountRepository.GetByIdAsync(application.AccountId.Value);
                if (account != null)
                {
                    var accountUpdateResult = await _accountRepository.UpdateStatusAsync(account.Id, "Active");
                    if (!accountUpdateResult) return false;
                }
            }

            // 5) Rejected → cập nhật Account = Pending (không động đến Lecturer)
            if (request.Status == false)
            {
                if (!application.AccountId.HasValue) return false;

                var account = await _accountRepository.GetByIdAsync(application.AccountId.Value);
                if (account != null)
                {
                    var accountUpdateResult = await _accountRepository.UpdateStatusAsync(account.Id, "Pending");
                    if (!accountUpdateResult) return false;
                }
            }
            // 6) Gửi Email thông báo(THÊM MỚI)
            try
            {
                var account = await _accountRepository.GetByIdAsync(application.AccountId.Value);
                if (account == null)
                {
                    // Không tìm thấy tài khoản, nhưng không nên báo lỗi
                    return true;
                }

                string statusString = request.Status == true ? "Được duyệt" : "Bị từ chối";
                string htmlBody;

                // --- Biến CSS chung để dễ quản lý ---
                string fontFamily = "Arial, 'Helvetica Neue', Helvetica, sans-serif";
                string brandColor = "#4CAF50"; // Xanh lá
                string brandColorRejected = "#e74c3c"; // Đỏ (chỉ dùng cho nút từ chối nếu muốn)
                string bgColor = "#f4f7f6";
                string cardColor = "#ffffff";
                string textColor = "#555555";
                string lightTextColor = "#999999";
                string linkLogin = "http://localhost:5173/login";
                string emailContact = "skillup.fpt@gmail.com";

                if (request.Status == true)
                {
                    // === EMAIL CHẤP THUẬN ===
                    htmlBody = $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Chúc mừng! Bạn đã trở thành Giảng viên SkillUp</title>
</head>
<body style='margin: 0; padding: 0; background-color: {bgColor}; font-family: {fontFamily};'>
    <span style='display:none; font-size:1px; color:#ffffff; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;'>
        Chúc mừng {account.Fullname}! Đơn đăng ký giảng viên của bạn đã được chấp thuận.
    </span>

    <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color: {bgColor};'>
        <tr>
            <td align='center' style='padding: 20px;'>
                
                <table width='100%' border='0' cellspacing='0' cellpadding='0' style='max-width: 600px; background-color: {cardColor}; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);'>
                    
                    <tr>
                        <td align='center' style='padding: 30px 20px; background-color: {brandColor};'>
                            <h1 style='color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;'>SkillUp</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style='padding: 40px 30px 30px 30px; color: {textColor}; font-size: 16px; line-height: 1.7;'>
                            <h2 style='color: #333333; margin-top: 0; font-size: 24px;'>Xin chào {account.Fullname},</h2>
                            <p style='margin: 0 0 20px 0;'>Chúc mừng! Đơn đăng ký trở thành giảng viên của bạn tại SkillUp đã được <strong>chấp thuận</strong>.</p>
                            <p style='margin: 0 0 30px 0;'>Tài khoản của bạn đã được kích hoạt làm giảng viên. Bạn có thể bắt đầu tạo và quản lý các khóa học của mình ngay bây giờ. Hãy bắt đầu hành trình giảng dạy cùng SkillUp!</p>

                            <table border='0' cellspacing='0' cellpadding='0' width='100%'>
                                <tr>
                                    <td align='center'>
                                        <a href='{linkLogin}' target='_blank' style='background-color: {brandColor}; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;'>
                                            Đăng nhập ngay
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style='margin: 30px 0 0 0;'>Cảm ơn bạn đã tham gia cộng đồng SkillUp. Chúng tôi rất vui mừng chào đón bạn!</p>
                        </td>
                    </tr>

                    <tr>
                        <td style='padding: 30px; background-color: #f9f9f9; border-top: 1px solid #eeeeee;'>
                            <p style='margin: 0; font-size: 13px; color: {lightTextColor}; text-align: center;'>
                                &copy; {DateTime.Now.Year} SkillUp. All rights reserved.<br>
                                Nếu bạn gặp bất kỳ vấn đề nào, vui lòng liên hệ <a href='mailto:{emailContact}' style='color: {brandColor}; text-decoration: none;'>{emailContact}</a>.
                            </p>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>";
                }
                else
                {
                    // === EMAIL TỪ CHỐI ===

                    // Cập nhật Reason Box cho chuyên nghiệp
                    string reasonHtml = string.IsNullOrEmpty(request.Reason)
                        ? ""
                        : $@"<table width='100%' border='0' cellspacing='0' cellpadding='0' style='margin: 25px 0;'>
                     <tr>
                         <td style='background-color: #fef0f0; border: 1px solid #fde0e0; border-radius: 8px; padding: 20px; font-size: 15px; line-height: 1.6; color: #721c24;'>
                             <strong style='color: {brandColorRejected};'>Phản hồi từ đội ngũ xét duyệt:</strong><br>
                             {request.Reason}
                         </td>
                     </tr>
                 </table>";

                    htmlBody = $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Cập nhật đơn đăng ký giảng viên SkillUp</title>
</head>
<body style='margin: 0; padding: 0; background-color: {bgColor}; font-family: {fontFamily};'>
    <span style='display:none; font-size:1px; color:#ffffff; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;'>
        Cập nhật về đơn đăng ký giảng viên của bạn tại SkillUp.
    </span>

    <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color: {bgColor};'>
        <tr>
            <td align='center' style='padding: 20px;'>
                
                <table width='100%' border='0' cellspacing='0' cellpadding='0' style='max-width: 600px; background-color: {cardColor}; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);'>
                    
                    <tr>
                        <td align='center' style='padding: 30px 20px; background-color: {brandColor};'>
                            <h1 style='color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;'>SkillUp</h1>
                        </td>
                    </tr>

                    <tr>
                        <td style='padding: 40px 30px 30px 30px; color: {textColor}; font-size: 16px; line-height: 1.7;'>
                            <h2 style='color: #333333; margin-top: 0; font-size: 24px;'>Xin chào {account.Fullname},</h2>
                            <p style='margin: 0 0 20px 0;'>Chúng tôi rất tiếc phải thông báo rằng đơn đăng ký trở thành giảng viên của bạn tại SkillUp đã <strong>bị từ chối</strong>.</p>
                            
                            {reasonHtml}

                            <p style='margin: 0 0 30px 0;'>Bạn có thể vào hệ thống cập nhật lại thông tin và nộp đơn lại.</p>

                            <table border='0' cellspacing='0' cellpadding='0' width='100%'>
                                <tr>
                                    <td align='center'>
                                        <a href='{linkLogin}' target='_blank' style='background-color: {brandColor}; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;'>
                                            Xem lại thông tin
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style='margin: 30px 0 0 0;'>Cảm ơn bạn đã quan tâm đến SkillUp. Hy vọng sẽ có cơ hội làm việc cùng bạn trong tương lai!</p>
                        </td>
                    </tr>

                    <tr>
                        <td style='padding: 30px; background-color: #f9f9f9; border-top: 1px solid #eeeeee;'>
                            <p style='margin: 0; font-size: 13px; color: {lightTextColor}; text-align: center;'>
                                &copy; {DateTime.Now.Year} SkillUp. All rights reserved.<br>
                                Nếu bạn cần hỗ trợ thêm, vui lòng liên hệ <a href='mailto:{emailContact}' style='color: {brandColor}; text-decoration: none;'>{emailContact}</a>.
                            </p>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>";
                }

                // Gọi EmailService đã sửa
                await _emailService.SendStatusEmailAsync(account.Email, account.Fullname, statusString, htmlBody);
            }
            catch (Exception)
            {
                // Tùy chọn: Log lỗi gửi email, nhưng không làm hỏng toàn bộ giao dịch
                // Việc gửi mail thất bại không nên làm cho request `UpdateStatusAsync` trả về false
            }
            return true;
        }




        public async Task<List<LecturerApplicationResponseDto>> GetAllLecturerApplicationsAsync()
        {
            var applications = await _lecturerApplicationRepository.GetAllLecturerApplicationsAsync();

            // Kiểm tra dữ liệu trả về có null không
            if (applications == null || applications.Count == 0)
            {
                return new List<LecturerApplicationResponseDto>(); // Trả về danh sách rỗng nếu không có dữ liệu
            }

            return applications.Select(app => new LecturerApplicationResponseDto
            {
                Id = app.Id,
                Cv = app.Cv ?? string.Empty,  // Nếu null, thay bằng chuỗi rỗng
                Degree = app.Degree ?? string.Empty,
                Title = app.Title ?? string.Empty,
                Profession = app.Profession ?? string.Empty,
                Description = app.Description,
                Status = app.Status,
                RejectReason = app.Reason,
                CreatedAt = app.CreatedAt,
                UpdatedAt = null // Sẽ thêm sau khi update database
            }).OrderByDescending(x => x.CreatedAt).ToList();
        }

    }
}
