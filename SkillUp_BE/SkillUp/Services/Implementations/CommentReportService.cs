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
                CreatedAt = DateTime.UtcNow,
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
    }
}