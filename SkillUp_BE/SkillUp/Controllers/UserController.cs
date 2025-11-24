using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.User;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	[Authorize]
	public class UserController : ControllerBase
	{
		private readonly ICurrentUserService _currentUserService;
		private readonly IUserService _userService;

		public UserController(ICurrentUserService currentUserService, IUserService userService)
		{
			_currentUserService = currentUserService;
			_userService = userService;
		}

		[HttpGet("View-Profile")]
		public async Task<IActionResult> GetMyProfile()
		{
			try
			{
				var userId = _currentUserService.UserId;
				if (!userId.HasValue)
				{
					return Unauthorized(new APIReturn
					{
						code = 401,
						message = "Token không hợp lệ hoặc không tìm thấy ID người dùng"
					});
				}
				var rs = await _userService.GetMyProfileAsync(userId.Value);

				if (rs == null)
				{
					return NotFound(new APIReturn
					{
						code = 404,
						message = "Không tìm thấy hồ sơ người dùng"
					});
				}

				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy thông tin hồ sơ thành công",
					data = new List<object> { rs }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = $"Lỗi máy chủ nội bộ: {ex.Message}"
				});
			}
		}

		[HttpPut("Edit-profile")]
		public async Task<IActionResult> EditProfile([FromBody] UpdateProfileDTO updateProfileDTO)
		{
			if (!ModelState.IsValid)
			{
				return BadRequest(new APIReturn
				{
					code = 400,
					message = "Dữ liệu không hợp lệ"
				});
			}
			try
			{
				var userId = _currentUserService.UserId;

				if (!userId.HasValue)

				{

					return Unauthorized(new APIReturn { code = 401, message = "Token không hợp lệ" });

				}
				var result = await _userService.UpdateProfileAsync(userId.Value, updateProfileDTO);
				if (!result)

				{

					return BadRequest(new APIReturn { code = 400, message = "Cập nhật thất bại" });

				}
				return Ok(new APIReturn { code = 200, message = "Cập nhật hồ sơ thành công" });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = $"Lỗi máy chủ nội bộ: {ex.Message}"
				});
			}
		}
		[HttpPost("upload-avatar")]
		public async Task<IActionResult> UploadAvatar(IFormFile avatar)
		{
			try
			{
				var userId = _currentUserService.UserId;
				if (!userId.HasValue)
				{
					return Unauthorized(new APIReturn
					{
						code = 401,
						message = "Token không hợp lệ hoặc không tìm thấy người dùng",
						data = new List<object>()
					});
				}

				var avatarUrl = await _userService.UpdateAvatarAsync(userId.Value, avatar);

				if (string.IsNullOrEmpty(avatarUrl))
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Không thể cập nhật ảnh đại diện. Vui lòng kiểm tra định dạng hoặc dung lượng tệp.",
						data = new List<object>()
					});
				}

				return Ok(new APIReturn
				{
					code = 200,
					message = "Cập nhật ảnh đại diện thành công",
					data = new List<object> { new { avatarUrl } }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = $"Có lỗi xảy ra: {ex.Message}",
					data = new List<object>()
				});
			}
		}

		[HttpGet("All-Users")]
		[Authorize]
		public async Task<IActionResult> GetAllUsers()
		{
			try
			{
				var users = await _userService.GetAllUsersAsync();

				if (users == null)
				{
					return NotFound(new APIReturn
					{
						code = 404,
						message = "Không tìm thấy danh sách người dùng."
					});
				}

				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy danh sách người dùng thành công",
					data = new List<object> { users }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = $"Lỗi máy chủ nội bộ: {ex.Message}"
				});
			}
		}
		[HttpPut("update-status")]
		[Authorize]
		public async Task<IActionResult> UpdateUserStatus([FromBody] UserStatusDTO dto)
		{
			if (dto == null || dto.Id == Guid.Empty || string.IsNullOrWhiteSpace(dto.Status))
			{
				return BadRequest(new APIReturn
				{
					code = 400,
					message = "Dữ liệu đầu vào không hợp lệ."
				});
			}

			try
			{
				var result = await _userService.ToggleStatusUser(dto.Id, dto.Status);

				if (!result)
				{
					return NotFound(new APIReturn
					{
						code = 404,
						message = "Không tìm thấy người dùng cần cập nhật."
					});
				}

				return Ok(new APIReturn
				{
					code = 200,
					message = $"Cập nhật trạng thái người dùng thành công: {dto.Status}"
				});
			}
			catch (Exception ex)
			{
				return BadRequest(new APIReturn
				{
					code = 400,
					message = $"Lỗi khi cập nhật trạng thái: {ex.Message}"
				});
			}
		}

		[HttpPut("all-mod")]
		[Authorize]
		public async Task<IActionResult> GetAllModerators()
		{
			try
			{
				var mods = await _userService.GetAllModerators();

				if (mods == null)
				{
					return NotFound(new APIReturn
					{
						code = 404,
						message = "Không tìm thấy danh sách moderator."
					});
				}

				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy danh sách moderator thành công",
					data = new List<object> { mods }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = $"Lỗi máy chủ nội bộ: {ex.Message}"
				});
			}
		}
	}
}
