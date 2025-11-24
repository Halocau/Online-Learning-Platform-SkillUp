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
        private readonly ICurrentUserService _currentUserService;

        public NotifyController(INotifyService notifyService, ICurrentUserService currentUserService)
        {
            _notifyService = notifyService;
            _currentUserService = currentUserService;
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

        [HttpPut("read/{id}")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            var accountId = _currentUserService.UserId;
            if (accountId == null) return Unauthorized(new { message = "Chưa đăng nhập" });

            try
            {
                var result = await _notifyService.MarkAsReadAsync(id, accountId.Value);

                if (!result) return NotFound(new { message = "Không tìm thấy thông báo hoặc lỗi xử lý" });

                return Ok(new { message = "Đã đánh dấu đã đọc" });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid(); // 403 nếu cố đọc thông báo của người khác
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var accountId = _currentUserService.UserId;
            if (accountId == null) return Unauthorized(new { message = "Chưa đăng nhập" });

            try
            {
                await _notifyService.MarkAllAsReadAsync(accountId.Value);
                return Ok(new { message = "Đã đánh dấu tất cả là đã đọc" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}