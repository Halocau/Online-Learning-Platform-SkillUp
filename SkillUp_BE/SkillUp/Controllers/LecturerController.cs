using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Implementations;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class LecturerController : ControllerBase
	{
		private readonly ILecturerService _lecturerService;
		private readonly ICurrentUserService _currentUserService;

		public LecturerController(ILecturerService lecturerService, ICurrentUserService currentUserService)
		{
			_lecturerService = lecturerService;
			_currentUserService = currentUserService;
		}
		[HttpGet("profile/{accId}")]
		[AllowAnonymous]
		public async Task<IActionResult> GetLecturerPublicProfile(Guid accId)
		{
			try
			{
				var profile = await _lecturerService.GetLecturerPublicProfileAsync(accId);

				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy thông tin giảng viên thành công",
					data = new List<object> { profile }
				});
			}
			catch (Exception ex)
			{
				if (ex.Message.Contains("Không tìm thấy"))
				{
					return NotFound(new APIReturn
					{
						code = 404,
						message = ex.Message,
						data = new List<object>()
					});
				}
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = $"Có lỗi xảy ra: {ex.Message}",
					data = new List<object>()
				});
			}
		}

		[HttpPut("Update-Lecturer-Percent/{lecturerId}")]
		[Authorize]
		public async Task<IActionResult> UpdateLecturerPercent(Guid lecturerId, double percent)
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

				if (percent < 0 || percent > 100)
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Phần trăm phải nằm trong khoảng từ 0 đến 100.",
						data = new List<object>()
					});
				}

				var success = await _lecturerService.UpdateLecturerPercentAsync(lecturerId, percent);
				if (success)
				{
					return Ok(new APIReturn
					{
						code = 200,
						message = "Cập nhật phần trăm thành công",
						data = new List<object>()
					});
				}
				else
				{
					return NotFound(new APIReturn
					{
						code = 404,
						message = "Giảng viên không tồn tại.",
						data = new List<object>()
					});
				}
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
