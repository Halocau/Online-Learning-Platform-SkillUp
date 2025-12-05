using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class SystemModeratorDashboardController : ControllerBase
	{
		private readonly ISystemModeratorDashboardService _moderatorDashboardService;
		public SystemModeratorDashboardController(ISystemModeratorDashboardService moderatorDashboardService)
		{
			_moderatorDashboardService = moderatorDashboardService;
		}

		[HttpGet("system-mod-dashboard")]
		[Authorize]
		public async Task<IActionResult> GetSystemModDashboardStats()
		{
			try
			{
				var result = await _moderatorDashboardService.GetSysModDashboardStatisticsAsync();
				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy thông số system moderator dashboard thành công",
					data = new List<object> { result }
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
