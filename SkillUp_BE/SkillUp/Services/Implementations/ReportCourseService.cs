using SkillUp.BussinessObjects.DTOs.ReportCourse;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class ReportCourseService : IReportCourseService
    {
        private readonly IReportCourseRepository _repository;

        public ReportCourseService(IReportCourseRepository repository)
        {
            _repository = repository;
        }

        public async Task<string?> CreateReportAsync(Guid accountId, CreateReportCourseDto request)
        {
            var student = await _repository.GetStudentByAccountIdAsync(accountId);
            if (student == null) return "Tài khoản của bạn không phải là Học viên.";

            var hasReported = await _repository.HasReportedAsync(student.Id, request.CourseId);
            if (hasReported) return "Bạn đã gửi báo cáo cho khóa học này rồi.";

            var report = new ReportCourse
            {
                Id = Guid.NewGuid(),
                CourseId = request.CourseId,
                StudentId = student.Id,
                Description = request.Description,
                CreatedAt = DateTime.UtcNow,
                Status = "Pending"
            };

            await _repository.AddAsync(report);
            return null; // Null nghĩa là thành công
        }

        public async Task<List<ReportCourseResponseDto>> GetAllReportsAsync()
        {
            var reports = await _repository.GetAllAsync();

            // Map Entity -> DTO Response
            return reports.Select(r => new ReportCourseResponseDto
            {
                Id = r.Id,
                Description = r.Description,
                Status = r.Status,
                CreatedAt = r.CreatedAt,
                CourseName = r.Course?.Title ?? "Unknown",
                StudentName = r.Student?.Account?.Fullname ?? "Unknown"
            }).ToList();
        }

        public async Task<List<CourseReportGroupDto>> GetGroupedReportsAsync()
        {
            var reports = await _repository.GetAllAsync();

            // Map Entity -> DTO Response
            var reportDtos = reports.Select(r => new ReportCourseResponseDto
            {
                Id = r.Id,
                Description = r.Description,
                Status = r.Status,
                CreatedAt = r.CreatedAt,
                CourseName = r.Course?.Title ?? "Unknown",
                StudentName = r.Student?.Account?.Fullname ?? "Unknown"
            }).ToList();

            // Group by CourseName
            var grouped = reportDtos
                .GroupBy(r => r.CourseName)
                .Select(g => new CourseReportGroupDto
                {
                    CourseName = g.Key,
                    TotalCount = g.Count(),
                    PendingCount = g.Count(r => r.Status == "Pending"),
                    ResolvedCount = g.Count(r => r.Status == "Accepted" || r.Status == "Rejected"),
                    Reports = g.OrderByDescending(r => r.CreatedAt).ToList()
                })
                .OrderByDescending(g => g.TotalCount)
                .ToList();

            return grouped;
        }

        public async Task<string?> UpdateReportStatusAsync(Guid reportId, string newStatus)
        {
            var report = await _repository.GetByIdAsync(reportId);

            // Trường hợp 1: Không tìm thấy
            if (report == null)
            {
                return "Not Found"; // Trả về mã lỗi để Controller biết là 404
            }

            // Trường hợp 2: Đã xử lý rồi (Status khác Pending) thì không cho sửa nữa
            if (report.Status != "Pending")
            {
                return "Bạn đã xử lý báo cáo này rồi. Không thể thay đổi trạng thái nữa.";
            }

            // --- Logic Update (Như cũ) ---
            report.Status = newStatus;

            if (newStatus == "Accepted")
            {
                if (report.Course != null)
                {
                    report.Course.IsActive = false;
                }
            }

            await _repository.UpdateAsync(report);

            return null; // Null nghĩa là thành công (Success)
        }
    }
}