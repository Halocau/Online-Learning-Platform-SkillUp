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

        public AdminController(IBackgroundTaskQueue taskQueue)
        {
            _taskQueue = taskQueue;
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
    }
}
