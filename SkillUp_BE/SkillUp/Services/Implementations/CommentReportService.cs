using SkillUp.BussinessObjects.DTOs.Comment; // <-- Sửa namespace DTO
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using System;
using System.Threading.Tasks;

namespace SkillUp.Services.Implementations
{
    public class CommentReportService : ICommentReportService
    {
        private readonly ICommentReportRepository _reportRepo;
        private readonly ICommentPostRepository _commentRepo;

        public CommentReportService(ICommentReportRepository reportRepo, ICommentPostRepository commentRepo)
        {
            _reportRepo = reportRepo;
            _commentRepo = commentRepo;
        }

        public async Task<CommentReportDto> CreateReportAsync(CreateCommentReportDto dto, Guid accountId)
        {
            // 1. Kiểm tra comment có tồn tại và đang active không
            var comment = await _commentRepo.GetByIdAsync(dto.CommentPostId);
            if (comment == null || !comment.IsActive)
            {
                throw new Exception("Không tìm thấy comment hoặc comment đã bị xóa.");
            }

            // 2. Kiểm tra xem user đã report comment này chưa
            if (await _reportRepo.HasAlreadyReportedAsync(accountId, dto.CommentPostId))
            {
                throw new Exception("Bạn đã báo cáo comment này rồi.");
            }

            // 3. Tạo đối tượng report mới
            var newReport = new CommentReportPost
            {
                Id = Guid.NewGuid(),
                CommentPostId = dto.CommentPostId,
                Reason = dto.Reason,
                AccountId = accountId, // Người dùng đang đăng nhập
                CreatedAt = DateTime.Now,
                Status = "Pending" // Trạng thái mặc định khi mới tạo
            };

            // 4. Lưu vào DB
            var savedReport = await _reportRepo.CreateAsync(newReport);

            // 5. Map sang DTO để trả về
            return new CommentReportDto
            {
                Id = savedReport.Id,
                Reason = savedReport.Reason,
                Status = savedReport.Status,
                CreatedAt = savedReport.CreatedAt,
                AccountId = savedReport.AccountId,
                CommentPostId = savedReport.CommentPostId,
                ReporterName = savedReport.Account?.Fullname ?? ""
            };
        }

        public async Task<CommentReportDto> ResolveReportAsync(ResolveCommentReportDto dto)
        {
            var report = await _reportRepo.GetByIdAsync(dto.ReportId);

            if (report == null)
                throw new Exception("Không tìm thấy báo cáo.");

            if (report.Status != "Pending")
                throw new Exception($"Báo cáo này đã được xử lý (Trạng thái: {report.Status}).");

            if (report.CommentPost == null)
                throw new Exception("Không tìm thấy bình luận liên quan đến báo cáo này.");

            if (dto.ShouldDeleteComment)
            {
                // Quyết định: Xóa comment
                report.Status = "Accepted"; // Cập nhật status report

                // Soft-delete comment
                report.CommentPost.IsActive = false;
                report.CommentPost.UpdatedAt = DateTime.Now;
                await _commentRepo.UpdateAsync(report.CommentPost);
            }
            else
            {
                // Quyết định: Bỏ qua report
                report.Status = "Rejected";
            }

            // Lưu thay đổi status của report
            await _reportRepo.UpdateAsync(report);

            // Trả về DTO
            return new CommentReportDto
            {
                Id = report.Id,
                Reason = report.Reason,
                Status = report.Status, // Status mới (Resolved hoặc Dismissed)
                CreatedAt = report.CreatedAt,
                AccountId = report.AccountId,
                CommentPostId = report.CommentPostId,
                ReporterName = report.Account?.Fullname ?? ""
            };
        }
    }
}