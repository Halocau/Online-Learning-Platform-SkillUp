// File: /Services/Implementations/CommentReportLessonService.cs
using SkillUp.BussinessObjects.DTOs.Comment;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class CommentReportLessonService : ICommentReportLessonService
    {
        private readonly ICommentReportLessonRepository _reportRepo;
        private readonly ICommentLessonRepository _commentRepo; // Dùng để xóa comment

        // Không tiêm HubContext
        public CommentReportLessonService(
            ICommentReportLessonRepository reportRepo,
            ICommentLessonRepository commentRepo)
        {
            _reportRepo = reportRepo;
            _commentRepo = commentRepo;
        }

        public async Task<CommentReportLessonDto> CreateReportAsync(CreateCommentReportLessonDto dto, Guid reporterAccountId)
        {
            var report = new CommentReportLesson
            {
                Id = Guid.NewGuid(),
                AccountId = reporterAccountId,
                CommentLessonId = dto.CommentLessonId,
                Reason = dto.Reason,
                Status = "Pending",
                CreatedAt = DateTime.Now
            };

            // 1. Lưu báo cáo (Repo đã load relations)
            var savedReport = await _reportRepo.CreateAsync(report);

            // 2. Map sang DTO
            return MapToDto(savedReport);
        }

        public async Task<IEnumerable<CommentReportLessonDto>> GetPendingReportsAsync()
        {
            var reports = await _reportRepo.GetPendingReportsAsync();
            return reports.Select(MapToDto); // Dùng hàm map thủ công
        }

        public async Task<CommentReportLessonDto> UpdateReportStatusAsync(UpdateCommentReportStatusDto dto)
        {
            var report = await _reportRepo.GetByIdAsync(dto.ReportId);
            if (report == null)
                throw new Exception("Không tìm thấy báo cáo.");

            // Logic nghiệp vụ mới
            if (dto.IsApproved == true)
            {
                // 1. Nếu TRUE -> Accept và Xóa Comment
                report.Status = "Accept"; // (Chấp nhận)

                var comment = await _commentRepo.GetByIdAsync(report.CommentLessonId);
                if (comment != null)
                {
                    comment.IsActive = false; // Chuyển isActive thành false (xóa)
                    comment.UpdatedAt = DateTime.Now;
                    await _commentRepo.UpdateAsync(comment);
                }
            }
            else
            {
                // 2. Nếu FALSE -> Reject
                report.Status = "Reject"; // (Từ chối)
                // Không làm gì comment, giữ nguyên
            }

            // Cập nhật trạng thái (Accept/Reject) của chính báo cáo đó
            await _reportRepo.UpdateAsync(report);

            return MapToDto(report);
        }

        // ... (Hàm MapToDto helper) ...
       
    

    // Hàm Map DTO thủ công (Helper function)
    private CommentReportLessonDto MapToDto(CommentReportLesson report)
        {
            return new CommentReportLessonDto
            {
                Id = report.Id,
                Reason = report.Reason,
                Status = report.Status,
                CreatedAt = report.CreatedAt,
                ReporterId = report.AccountId,
                ReporterName = report.Account?.Fullname ?? "",
                CommentId = report.CommentLessonId,
                CommentContents = report.CommentLesson?.Contents ?? "",
                CommentAuthorName = report.CommentLesson?.Account?.Fullname ?? ""
            };
        }
    }
}