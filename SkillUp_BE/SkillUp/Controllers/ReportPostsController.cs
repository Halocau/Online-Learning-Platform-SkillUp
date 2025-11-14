using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.ReportPost;
using SkillUp.Services.Interfaces;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportPostsController : ControllerBase
    {
        private readonly IReportPostService _reportPostService;

        public ReportPostsController(IReportPostService reportPostService)
        {
            _reportPostService = reportPostService;
        }

        [HttpPost]
        [Authorize(Roles = "Student")] // Chỉ Student mới được báo cáo
        public async Task<IActionResult> CreateReport([FromBody] CreateReportPostDto dto)
        {
            var reporterAccountId = User.FindFirstValue("userId");
            if (string.IsNullOrEmpty(reporterAccountId))
            {
                return Unauthorized("Không tìm thấy thông tin người dùng.");
            }

            try
            {
                var reportDto = await _reportPostService.CreateReportPostAsync(dto, Guid.Parse(reporterAccountId));

                // Trả về 201 Created
                // Cần 1 hàm GetById để trỏ tới, tạm thời trả về Created
                return CreatedAtAction(nameof(CreateReport), new { id = reportDto.Id }, reportDto);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message }); // 404
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message }); // 409
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi nội bộ: {ex.Message}" });
            }
        }

        [HttpGet("Pending")]
        [Authorize(Roles = "Content Morderator")] 
        public async Task<IActionResult> GetAllPendingReports()
        {
            try
            {
                // Gọi service để lấy danh sách
                var reports = await _reportPostService.GetAllPendingReportsAsync();

                // Trả về 200 OK
                return Ok(reports);
            }
            catch (Exception ex)
            {
                // Ghi log lỗi ở đây nếu cần
                return StatusCode(500, new { message = $"Lỗi nội bộ: {ex.Message}" });
            }
        }

        [HttpPut("Resolve/{id}")]
        [Authorize(Roles = "Content Morderator")]
        public async Task<IActionResult> ProcessReport([FromRoute] Guid id, [FromBody] ProcessReportDto dto)
        {
            try
            {
                var updatedReport = await _reportPostService.ProcessReportAsync(id, dto);
                return Ok(updatedReport);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message }); // 404
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message }); // 409
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message }); // 400
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Lỗi nội bộ: {ex.Message}" });
            }
        }
    }
}