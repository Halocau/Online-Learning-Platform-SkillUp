using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Banner;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Common;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class BannerController : ControllerBase
	{
		private readonly IBannerService _bannerService;
		private readonly ICurrentUserService _currentUserService;
		private readonly ICloudinaryService _cloudinaryService;
		public BannerController(IBannerService bannerService, ICurrentUserService currentUserService, ICloudinaryService cloudinaryService)
		{
			_bannerService = bannerService;
			_currentUserService = currentUserService;
			_cloudinaryService = cloudinaryService;
		}

		[HttpGet("all-banners")]
		public async Task<IActionResult> GetAllBanners()
		{
			try
			{
				if (_currentUserService.RoleId != 3)
				{
					return Unauthorized(new APIReturn
					{
						code = 401,
						message = "Bạn không phải là Content Moderator!",
						data = new List<object>()
					});
				}
				var banners = await _bannerService.GetAllBanners();
				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy danh sách banner thành công!",
					data = new List<object> { banners }
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

		[HttpGet("active-banners")]
		public async Task<IActionResult> GetActiveBanners()
		{
			try
			{
				var banners = await _bannerService.GetActiveBanners();
				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy danh sách banner thành công!",
					data = new List<object> { banners }
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

		[HttpGet("banner/{bannerId}")]
		public async Task<IActionResult> GetById(int bannerId)
		{
			try
			{
				var banner = await _bannerService.GetBannerById(bannerId);
				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy thông tin banner thành công!",
					data = new List<object> { banner }
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

		[HttpPost("create-banner")]
		public async Task<IActionResult> CreateBanner([FromForm] BannerCreateDTO bannerCreateDTO, IFormFile file)
		{
			try
			{
				if (_currentUserService.RoleId != 3)
				{
					return Unauthorized(new APIReturn
					{
						code = 401,
						message = "Bạn không phải là Content Moderator!",
						data = new List<object>()
					});
				}
				if (!ModelState.IsValid)
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Dữ liệu không hợp lệ!",
						data = new List<object>()
					});
				}
				string uploadResult = null!;
				if (file != null)
				{
					uploadResult = await _cloudinaryService.UploadImageAsync(file);
				}
				var banner = await _bannerService.CreateBanner(bannerCreateDTO, uploadResult);
				return Ok(new APIReturn
				{
					code = 200,
					message = "Tạo banner mới thành công!",
					data = new List<object> { banner }
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

		[HttpPut("update-banner")]
		public async Task<IActionResult> UpdateBanner([FromForm] BannerUpdateDTO bannerUpdateDTO, IFormFile? file)
		{
			try
			{
				if (_currentUserService.RoleId != 3)
				{
					return Unauthorized(new APIReturn
					{
						code = 401,
						message = "Bạn không phải là Content Moderator!",
						data = new List<object>()
					});
				}
				if (!ModelState.IsValid)
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Dữ liệu không hợp lệ!",
						data = new List<object>()
					});
				}
				string? uploadResult = null;
				if (file != null)
				{
					uploadResult = await _cloudinaryService.UploadImageAsync(file);
				}
				var banner = await _bannerService.UpdateBanner(bannerUpdateDTO, uploadResult);
				return Ok(new APIReturn
				{
					code = 200,
					message = "Cập nhật banner thành công!",
					data = new List<object> { banner }
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

		[HttpPut("toggle-banner")]
		public async Task<IActionResult> ToggleBanner(bool isActive, int bannerId)
		{
			try
			{
				if (_currentUserService.RoleId != 3)
				{
					return Unauthorized(new APIReturn
					{
						code = 401,
						message = "Bạn không phải là Content Moderator!",
						data = new List<object>()
					});
				}
				if (!ModelState.IsValid)
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Dữ liệu không hợp lệ!",
						data = new List<object>()
					});
				}
				var banner = await _bannerService.ToggleBanner(bannerId, isActive);
				return Ok(new APIReturn
				{
					code = 200,
					message = "Thay đổi trạng thái banner thành công!",
					data = new List<object> { banner }
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
