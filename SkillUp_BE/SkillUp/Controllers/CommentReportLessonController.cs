// File: /Controllers/CommentReportLessonController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Comment;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentReportLessonController : ControllerBase
    {
        private readonly ICommentReportLessonService _reportService;
        private readonly ICurrentUserService _currentUserService;

        public CommentReportLessonController(
            ICommentReportLessonService reportService,
            ICurrentUserService currentUserService)
        {
            _reportService = reportService;
            _currentUserService = currentUserService;
        }

        // API cho USER: Tạo báo cáo
        [Authorize]
        [HttpPost("Create")]
        public async Task<IActionResult> CreateReport([FromBody] CreateCommentReportLessonDto dto)
        {
            var accountId = _currentUserService.UserId.Value;
            try
            {
                var report = await _reportService.CreateReportAsync(dto, accountId);
                return Ok(new { code = 200, message = "Báo cáo của bạn đã được gửi", data = report });
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }

        // API cho MODERATOR: Xem báo cáo đang chờ
        [HttpGet("GetPending")]
        [Authorize(Roles = "Content Morderator")] // <-- Đổi Role
        public async Task<IActionResult> GetPendingReports()
        {
            var reports = await _reportService.GetPendingReportsAsync();
            return Ok(new { code = 200, message = "Lấy danh sách báo cáo thành công", data = reports });
        }

        [HttpPut("UpdateStatus")]
        [Authorize(Roles = "Content Morderator")]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateCommentReportStatusDto dto)
        {
            try
            {
                // Hàm này sẽ tự động nhận DTO mới (có bool IsApproved)
                // và gọi Service đã được cập nhật logic
                var updatedReport = await _reportService.UpdateReportStatusAsync(dto);
                return Ok(new { code = 200, message = "Cập nhật trạng thái báo cáo thành công", data = updatedReport });
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400});
            }
        }
    }
}