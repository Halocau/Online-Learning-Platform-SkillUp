using SkillUp.BussinessObjects.DTOs.LecturerApplication;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Implementations;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class LecturerApplicationService : ILecturerApplicationService
    {
        private readonly ILecturerApplicationRepository _lecturerApplicationRepository;
        private readonly IAccountRepository _accountRepository;
        private readonly CloudinaryService _cloudinaryService;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILecturerService _lecturerService;

        public LecturerApplicationService(ILecturerApplicationRepository lecturerApplicationRepository, IAccountRepository accountRepository, CloudinaryService cloudinaryService, ICurrentUserService currentUserService, ILecturerService lecturerService)
        {
            _lecturerApplicationRepository = lecturerApplicationRepository;
            _accountRepository = accountRepository;
            _cloudinaryService = cloudinaryService;
            _currentUserService = currentUserService;
            _lecturerService = lecturerService;
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

            // Upload Degree image to Cloudinary
            var degreeUrl = await _cloudinaryService.UploadImageAsync(request.DegreeFile, "skillup/lecturers/degrees");

            var application = new LecturerApplication
            {
                Id = Guid.NewGuid(),
                AccountId = accountId,
                Cv = cvUrl,
                Degree = degreeUrl,
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
            // Kiểm tra người dùng hiện tại
            var userId = _currentUserService.UserId;
            if (userId == null)
            {
                return false;
            }

            // Lấy thông tin đơn ứng tuyển từ repository
            var application = await _lecturerApplicationRepository.GetByIdAsync(applicationId);
            if (application == null)
            {
                return false; // Đơn ứng tuyển không tồn tại
            }

            // Cập nhật trạng thái đơn ứng tuyển
            var updateResult = await _lecturerApplicationRepository.UpdateStatusAsync(applicationId, request.Status, request.Reason);
            if (updateResult == null || !await _lecturerApplicationRepository.SaveChangesAsync())
            {
                return false;
            }

            // Nếu trạng thái là "Accepted", tạo Lecturer mới và cập nhật trạng thái của Account
            if (request.Status == true) // "Accepted"
            {
                // Tạo đối tượng Lecturer mới từ thông tin trong đơn ứng tuyển
                var newLecturer = new Lecturer
                {
                    Id = Guid.NewGuid(),
                    AccountId = application.AccountId ?? Guid.Empty, // Sử dụng accountId từ đơn ứng tuyển
                    Title = application.Title,
                    Profession = application.Profession
                    // Có thể thêm các thuộc tính khác của Lecturer nếu cần
                };

                // Lưu Lecturer mới vào cơ sở dữ liệu
                var lecturerCreationResult = await _lecturerService.CreateLecturerAsync(newLecturer);
                if (!lecturerCreationResult)
                {
                    return false; // Nếu tạo Lecturer mới thất bại
                }

                var account = await _accountRepository.GetByIdAsync(application.AccountId.Value); // AccountId đã được đảm bảo không null
                if (account != null)
                {
                    var accountUpdateResult = await _accountRepository.UpdateStatusAsync(account.Id, "Active");
                    if (!accountUpdateResult)
                    {
                        return false; // Nếu không cập nhật trạng thái Account thành công
                    }
                }
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
