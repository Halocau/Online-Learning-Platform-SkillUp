using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.ReportCourse;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;
// using SkillUp.ExceptionHandling; // Namespace chứa class APIReturn của bạn

namespace SkillUp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Yêu cầu đăng nhập
    public class ReportCourseController : ControllerBase
    {
        private readonly IReportCourseService _reportService;
        private readonly ICurrentUserService _currentUserService;

        public ReportCourseController(IReportCourseService reportService, ICurrentUserService currentUserService)
        {
            _reportService = reportService;
            _currentUserService = currentUserService;
        }

       
        [HttpPost]
        public async Task<IActionResult> CreateReport([FromBody] CreateReportCourseDto request)
        {
            try
            {
                var userId = _currentUserService.UserId;
                if (userId == null) return Unauthorized();

                var errorMessage = await _reportService.CreateReportAsync(userId.Value, request);

                if (!string.IsNullOrEmpty(errorMessage))
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = errorMessage,
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 201,
                    message = "Gửi báo cáo thành công!",
                    data = new List<object>()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn { code = 500, message = ex.Message, data = new List<object>() });
            }
        }

        // ==========================================
        // 2. VIEW ALL (Dành cho Moderator)
        // ==========================================
        [HttpGet("view-all")]
        [Authorize(Roles = "Content Morderator")] // Yêu cầu Role chính xác là "Moderator"
        public async Task<IActionResult> GetAllReports()
        {
            try
            {
                var reports = await _reportService.GetAllReportsAsync();
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy danh sách thành công",
                    data = new List<object> { reports }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn { code = 500, message = ex.Message, data = new List<object>() });
            }
        }

        [HttpGet("view-grouped")]
        [Authorize(Roles = "Content Morderator")] // Yêu cầu Role chính xác là "Moderator"
        public async Task<IActionResult> GetGroupedReports()
        {
            try
            {
                var groupedReports = await _reportService.GetGroupedReportsAsync();
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy danh sách nhóm báo cáo thành công",
                    data = new List<object> { groupedReports }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn { code = 500, message = ex.Message, data = new List<object>() });
            }
        }

       
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Content Morderator")] // Yêu cầu Role chính xác là "Moderator"
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateReportStatusDto request)
        {
            try
            {
                // 1. Validate Input
                if (request.Status != "Accepted" && request.Status != "Rejected")
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Trạng thái không hợp lệ. Chỉ chấp nhận: Accepted, Rejected.",
                        data = new List<object>()
                    });
                }

                // 2. Gọi Service
                var resultMessage = await _reportService.UpdateReportStatusAsync(id, request.Status);

                // 3. Xử lý các trường hợp trả về

                // Trường hợp thành công (resultMessage là null)
                if (resultMessage == null)
                {
                    return Ok(new APIReturn
                    {
                        code = 200,
                        message = $"Cập nhật trạng thái thành '{request.Status}' thành công.",
                        data = new List<object>()
                    });
                }

                // Trường hợp không tìm thấy
                if (resultMessage == "Not Found")
                {
                    return NotFound(new APIReturn
                    {
                        code = 404,
                        message = "Không tìm thấy báo cáo này.",
                        data = new List<object>()
                    });
                }

                // Trường hợp lỗi nghiệp vụ (Đã xử lý rồi...)
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = resultMessage, // "Bạn đã xử lý báo cáo này rồi..."
                    data = new List<object>()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn { code = 500, message = ex.Message, data = new List<object>() });
            }
        }
    }
}
