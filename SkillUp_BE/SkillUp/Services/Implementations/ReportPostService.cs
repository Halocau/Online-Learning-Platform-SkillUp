using SkillUp.BussinessObjects.DTOs.ReportPost;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using System;
using System.Threading.Tasks;

namespace SkillUp.Services.Implementations
{
    public class ReportPostService : IReportPostService
    {
        private readonly IReportPostRepository _reportPostRepo;
        private readonly IPostRepository _postRepo; // Giả sử bạn đã có
        

        public ReportPostService(
            IReportPostRepository reportPostRepo,
            IPostRepository postRepo)
        {
            _reportPostRepo = reportPostRepo;
            _postRepo = postRepo;
        }

        public async Task<ReportPostDto> CreateReportPostAsync(CreateReportPostDto dto, Guid reporterAccountId)
        {
            // 1. Kiểm tra Post có tồn tại không
            var post = await _postRepo.GetByIdAsync(dto.PostId); // Giả sử IPostRepository có hàm này
            if (post == null)
            {
                throw new KeyNotFoundException("Không tìm thấy bài đăng.");
            }

            // 2. Kiểm tra xem đã báo cáo bài này chưa
            var existingReport = await _reportPostRepo.GetExistingReportAsync(dto.PostId, reporterAccountId);
            if (existingReport != null)
            {
                throw new InvalidOperationException("Bạn đã báo cáo bài đăng này rồi.");
            }

            // 3. Tạo ReportPost mới
            var report = new ReportPost
            {
                Id = Guid.NewGuid(), // Tạo ID mới
                PostId = dto.PostId,
                AccountId = reporterAccountId,
                CreatedAt = DateTime.Now,
                Description = dto.Description,
                Status = "Pending" // Trạng thái mặc định
            };

            var savedReport = await _reportPostRepo.CreateAsync(report);

            // 4. Lấy lại đầy đủ thông tin (kèm Account) để Map DTO
            var fullReport = await _reportPostRepo.GetByIdAsync(savedReport.Id);

            return MapToDto(fullReport!);
        }

        public async Task<IEnumerable<ReportPostDto>> GetAllPendingReportsAsync()
        {
            var reports = await _reportPostRepo.GetAllPendingReportsAsync();
            // Dùng lại hàm MapToDto
            return reports.Select(MapToDto);
        }

        // --- CẬP NHẬT HÀM MAPTODTO ---
        private ReportPostDto MapToDto(ReportPost report)
        {
            return new ReportPostDto
            {
                Id = report.Id,
                PostId = report.PostId,
              
                PostTitle = report.Post?.Title ?? "Bài đăng không tồn tại", 
                AccountId = report.AccountId,
                ReporterName = report.Account?.Fullname ?? "Người dùng",
                CreatedAt = report.CreatedAt,
                Description = report.Description,
                Status = report.Status
            };
        }

        public async Task<ReportPostDto> ProcessReportAsync(Guid reportId, ProcessReportDto dto)
        {
            // 1. Tìm báo cáo
            var report = await _reportPostRepo.GetByIdAsync(reportId);
            if (report == null)
            {
                throw new KeyNotFoundException("Không tìm thấy báo cáo.");
            }

            // 2. TÌM BÀI POST LIÊN QUAN (Bước mới)
            var post = await _postRepo.GetByIdAsync(report.PostId);
            if (post == null)
            {
                // Nếu post không còn, tự động Reject báo cáo này
                if (report.Status == "Pending")
                {
                    report.Status = "Rejected";
                    await _reportPostRepo.UpdateAsync(report);
                }
                throw new InvalidOperationException("Bài đăng liên quan đến báo cáo này không còn tồn tại.");
            }

            // 3. KIỂM TRA TRẠNG THÁI BÀI POST (Bước mới quan trọng)
            // Nếu post đã "Inactive", nghĩa là nó ĐÃ BỊ XỬ LÝ bởi một báo cáo khác.
            if (post.Status == "Inactive")
            {
                // Tự động cập nhật báo cáo này thành "Accepted" nếu nó còn "Pending"
                if (report.Status == "Pending")
                {
                    report.Status = "Accepted";
                    await _reportPostRepo.UpdateAsync(report);
                }

                // Ném ra lỗi báo cho admin biết
                throw new InvalidOperationException("Bài đăng này đã bị xử lý (tắt) bởi một báo cáo trước đó.");
            }

            // 4. Kiểm tra nếu CHÍNH BÁO CÁO NÀY đã xử lý rồi
            if (report.Status != "Pending")
            {
                throw new InvalidOperationException("Báo cáo này đã được xử lý trước đó.");
            }

            // 5. Xử lý logic (Giữ nguyên)
            switch (dto.Action.ToLower())
            {
                case "accepted":
                    report.Status = "Accepted";

                    // Bài post chắc chắn đang "Active" (vì đã qua kiểm tra ở bước 3)
                    post.Status = "Inactive";
                    await _postRepo.UpdateAsync(post);

                    // (Nâng cao) Bạn cũng có thể cập nhật tất cả 
                    // report "Pending" khác của post này thành "Accepted" ở đây.
                    break;

                case "rejected":
                    report.Status = "Rejected";
                    break;

                default:
                    throw new ArgumentException("Hành động không hợp lệ. Chỉ chấp nhận 'accepted' hoặc 'rejected'.");
            }

            // 6. Cập nhật trạng thái báo cáo
            await _reportPostRepo.UpdateAsync(report);

            return MapToDto(report);
        }
    }
}