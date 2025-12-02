using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.NotifyDto;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IBackgroundTaskQueue _taskQueue;
		private readonly IPayrollService _payrollService;
		private readonly ICurrentUserService _currentUserService;

		public AdminController(IBackgroundTaskQueue taskQueue, IPayrollService payrollService, ICurrentUserService currentUserService)
        {
            _taskQueue = taskQueue;
            _payrollService = payrollService;
            _currentUserService = currentUserService;
		}
        [HttpPost("notify-all")]
        public async Task<IActionResult> SendSystemNotification([FromBody] CreateSystemNotificationDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new APIReturn { code = 400, message = "Dữ liệu không hợp lệ", data = new List<object> { ModelState } });
            }
            await _taskQueue.QueueBackgroundWorkItemAsync(async (serviceProvider, token) =>
            {
                using (var scope = serviceProvider.CreateScope())
                {
                    var notifyService = scope.ServiceProvider.GetRequiredService<INotifyService>();
                    Console.WriteLine($"[Background] Bắt đầu gửi thông báo: {request.Title}");
                    int count = await notifyService.CreateSystemNotificationAsync(request);
                    Console.WriteLine($"[Background] Đã gửi xong cho {count} người dùng.");
                }
            });
            return Ok(new APIReturn
            {
                code = 200,
                message = "Hệ thống đang gửi thông báo trong nền. Vui lòng đợi trong giây lát.",
                data = null
            });
        }

		[HttpGet("monthly-payroll-report")]
		[Authorize]
		public async Task<IActionResult> GetMonthlyReport([FromQuery] int month, [FromQuery] int year)
		{
			try
			{
				if (_currentUserService.RoleId != 1)
				{
					return Unauthorized(new APIReturn
					{
						code = 401,
						message = "Bạn không phải là Admin!",
						data = new List<object>()
					});
				}

				if (month < 1 || month > 12)
					return BadRequest(new APIReturn
					{
						code = 401,
						message = "Tháng không hợp lệ!",
						data = new List<object>()
					}); ;

				var report = await _payrollService.GenerateMonthlyPayrollReportAsync(month, year);

				return Ok(new APIReturn
				{
					code = 200,
					message = $"Lấy danh sách lương giảng viên tháng {month} năm {year} thành công",
					data = new List<object> { report }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = "Có lỗi xảy ra: " + ex.Message,
					data = new List<object>()
				});
			}
		}
	}
}
