using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.Services.Interfaces;
using System.Security.Authentication;

namespace SkillUp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotifyController : ControllerBase
    {
        private readonly INotifyService _notifyService;

        public NotifyController(INotifyService notifyService)
        {
            _notifyService = notifyService;
        }

        [HttpGet("GetMyNotifications")]
        public async Task<IActionResult> GetMyNotifications()
        {
            try
            {
                var notifications = await _notifyService.GetMyNotificationsAsync();

                // --- SỬA DÒNG NÀY ---
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                // Trả về lỗi nếu có
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }

        [HttpGet("GetByAccount/{accountId}")]
        public async Task<IActionResult> GetByAccountId(Guid accountId)
        {
            try
            {
                var notifications = await _notifyService.GetNotificationsByAccountIdAsync(accountId);

                // --- SỬA DÒNG NÀY ---
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var notifications = await _notifyService.GetAllNotificationsAsync();

                // --- SỬA DÒNG NÀY ---
                return Ok(notifications);
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }
    }
}