using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ModeratorContentController : ControllerBase
    {
        private readonly IModeratorContentService _contentModerationService;
        private readonly ICurrentUserService _currentUserService;

        public ModeratorContentController(IModeratorContentService contentModerationService, ICurrentUserService currentUserService)
        {
            _contentModerationService = contentModerationService;
            _currentUserService = currentUserService;
        }

        [HttpGet("dashboard")]
        [Authorize] 
        public async Task<IActionResult> GetDashboard()
        {
            try
            {
                // Có thể thêm kiểm tra quyền Admin/Moderator ở đây
                var roleId = _currentUserService.RoleId;
                if (roleId != 3) 
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Bạn không có quyền truy cập trang này",
                        data = null
                    });
                }

                var result = await _contentModerationService.GetDashboardAsync();

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy dữ liệu dashboard thành công",
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
