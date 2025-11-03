using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR; // <--- THÊM
using SkillUp.BussinessObjects.DTOs.Comment;
using SkillUp.Hubs; // <--- THÊM
using SkillUp.Services.Interfaces;
using System;
using System.Threading.Tasks;

namespace SkillUp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CommentReportController : ControllerBase
    {
        private readonly ICommentReportService _reportService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IHubContext<CommentHub> _hubContext; // <--- THÊM

        public CommentReportController(
            ICommentReportService reportService,
            ICurrentUserService currentUserService,
            IHubContext<CommentHub> hubContext) // <--- THÊM
        {
            _reportService = reportService;
            _currentUserService = currentUserService;
            _hubContext = hubContext; // <--- THÊM
        }

        [HttpPost("Create")]
        public async Task<IActionResult> CreateReport([FromBody] CreateCommentReportDto dto)
        {
            // ... (code cũ của bạn)
            if (_currentUserService.UserId == null)
                return BadRequest(new { code = 400, message = "Người dùng chưa đăng nhập" });

            var accountId = _currentUserService.UserId.Value;

            try
            {
                var report = await _reportService.CreateReportAsync(dto, accountId);
                return Ok(new
                {
                    code = 200,
                    message = "Báo cáo comment thành công",
                    data = report
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }

      // true là xóa
      // false là reject
        [HttpPut("Resolve")]
        [Authorize(Roles = "Content Morderator")] // QUAN TRỌNG: Chỉ Admin được phép
        public async Task<IActionResult> ResolveReport([FromBody] ResolveCommentReportDto dto)
        {
            try
            {
                var resolvedReport = await _reportService.ResolveReportAsync(dto);

                // Nếu comment bị xóa, gửi SignalR để client cập nhật
                if (dto.ShouldDeleteComment)
                {
                    await _hubContext.Clients.Group(resolvedReport.CommentPostId.ToString())
                        .SendAsync("DeleteComment", resolvedReport.CommentPostId);
                }

                return Ok(new
                {
                    code = 200,
                    message = "Xử lý báo cáo thành công",
                    data = resolvedReport
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }
        [HttpGet("All")]
        [Authorize(Roles = "Content Morderator")] // Chỉ Content Moderator mới được xem
        public async Task<IActionResult> GetAllReports()
        {
            try
            {
                var reports = await _reportService.GetAllReportsAsync();
                return Ok(new
                {
                    code = 200,
                    message = "Lấy danh sách báo cáo thành công",
                    data = reports
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
                   }
        }

        [HttpGet("Pending")]
        [Authorize(Roles = "Content Morderator")] // Chỉ Content Moderator mới được xem
        public async Task<IActionResult> GetPendingReports()

        {
            try
            {
                // Gọi service mới
                var reports = await _reportService.GetPendingReportsAsync();
                return Ok(new
                {
                    code = 200,
                    message = "Lấy danh sách báo cáo chờ xử lý thành công",
                    data = reports
    });
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }
    }
}