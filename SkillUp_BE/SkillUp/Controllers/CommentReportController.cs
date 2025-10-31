using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Comment; 
using SkillUp.Services.Interfaces;
using System;
using System.Threading.Tasks;

namespace SkillUp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Bắt buộc đăng nhập để report
    public class CommentReportController : ControllerBase
    {
        private readonly ICommentReportService _reportService;
        private readonly ICurrentUserService _currentUserService;

        public CommentReportController(ICommentReportService reportService, ICurrentUserService currentUserService)
        {
            _reportService = reportService;
            _currentUserService = currentUserService;
        }

        [HttpPost("Create")]
        public async Task<IActionResult> CreateReport([FromBody] CreateCommentReportDto dto)
        {
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
                // Bắt các lỗi (vd: "Đã báo cáo rồi", "Comment không tìm thấy")
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }
    }
}