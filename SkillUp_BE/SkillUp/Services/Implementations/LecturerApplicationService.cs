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
        private readonly ICloudinaryService _cloudinaryService;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILecturerService _lecturerService;
        private readonly IEmailService _emailService;

        public LecturerApplicationService(ILecturerApplicationRepository lecturerApplicationRepository, IAccountRepository accountRepository, ICloudinaryService cloudinaryService, ICurrentUserService currentUserService, ILecturerService lecturerService, IEmailService emailService)
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
            // roleId = 4 (Giảng viên) , Status = "Pending" 
            var account = await _accountRepository.GetByIdAsync(accountId);
            if (account == null || account.RoleId != 4 || !string.Equals(account.Status, "Pending", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            if (request.CvFile == null)
            {
                throw new ArgumentException("Vui lòng tải hồ sơ lên.");
            }

            if (request.DegreeFile == null || request.DegreeFile.Count == 0)
            {
                throw new ArgumentException("Vui lòng tải bằng cấp lên.");
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
                throw new UnauthorizedAccessException("Bạn không có quyền truy cập.");
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
            var userId = _currentUserService.UserId;
            if (userId == null) return false;

            if (_currentUserService.RoleId != 2)
            {
                return false;
            }

            var application = await _lecturerApplicationRepository.GetByIdAsync(applicationId);
            if (application == null) return false;

            var updateResult = await _lecturerApplicationRepository.UpdateStatusAsync(
                applicationId, request.Status, request.Reason
            );
            if (updateResult == null || !await _lecturerApplicationRepository.SaveChangesAsync())
                return false;

            if (request.Status == true)
            {
                if (!application.AccountId.HasValue) return false;

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

                var account = await _accountRepository.GetByIdAsync(application.AccountId.Value);
                if (account != null)
                {
                    var accountUpdateResult = await _accountRepository.UpdateStatusAsync(account.Id, "Active");
                    if (!accountUpdateResult) return false;
                }
            }

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
            try
            {
                var account = await _accountRepository.GetByIdAsync(application.AccountId.Value);
                await _emailService.SendLecturerApplicationStatusEmailAsync(account, request.Status, request.Reason);
            }
            catch (Exception)
            {
                throw new Exception("Lỗi cập nhật trạng thái đơn ứng tuyển giảng viên !");
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
                Email = app.Account?.Email,
                Status = app.Status,
                RejectReason = app.Reason,
                CreatedAt = app.CreatedAt,
                UpdatedAt = null // Sẽ thêm sau khi update database
            }).OrderByDescending(x => x.CreatedAt).ToList();
        }

    }
}
