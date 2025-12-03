using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LecturerDashboardController : ControllerBase
    {
        private readonly ILecturerDashboardService _dashboardService;
        private readonly ICurrentUserService _currentUserService;

        public LecturerDashboardController(
            ILecturerDashboardService dashboardService,
            ICurrentUserService currentUserService)
        {
            _dashboardService = dashboardService;
            _currentUserService = currentUserService;
        }

        [HttpGet("viewdashboard")]
        [Authorize]
        public async Task<IActionResult> GetDashboardOverview()
        {
            try
            {
                var accountId = _currentUserService.UserId;
                if (!accountId.HasValue)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ hoặc không tìm thấy thông tin người dùng",
                        data = null
                    });
                }

                var result = await _dashboardService.GetLecturerDashboardAsync(accountId.Value);

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy dữ liệu Dashboard thành công",
                    data = new List<object> { result }
                });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("chưa được đăng ký"))
                {
                    return NotFound(new APIReturn
                    {
                        code = 404,
                        message = ex.Message,
                        data = null
                    });
                }

                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Lỗi Server: {ex.Message}",
                    data = null
                });
            }
        }
        [HttpGet("revenue")]
        [Authorize]
        public async Task<IActionResult> GetRevenueReport([FromQuery] int? year, [FromQuery] Guid? courseId)
        {
            try
            {
                var accountId = _currentUserService.UserId;
                if (!accountId.HasValue)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ",
                        data = null
                    });
                }
                var result = await _dashboardService.GetRevenueReportAsync(accountId.Value, year, courseId);

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy báo cáo doanh thu thành công",
                    data = new List<object> { result }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Lỗi Server: {ex.Message}",
                    data = null
                });
            }
        }
        [HttpGet("students")]
        [Authorize]
        public async Task<IActionResult> GetEnrolledStudents([FromQuery] Guid? courseId)
        {
            try
            {
                var accountId = _currentUserService.UserId;
                if (!accountId.HasValue)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ",
                        data = null
                    });
                }
                var result = await _dashboardService.GetEnrolledStudentsAsync(accountId.Value, courseId);

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy danh sách học viên thành công",
                    data = new List<object> { result } 
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Lỗi Server: {ex.Message}",
                    data = null
                });
            }
        }
    }
}
