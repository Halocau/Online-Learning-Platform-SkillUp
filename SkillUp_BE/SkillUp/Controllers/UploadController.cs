using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using SkillUp.Services.Common;

namespace SkillUp.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class UploadController : ControllerBase
	{
		private readonly CloudinaryService _cloudinaryService;
		private readonly FtpVideoUploadService _ftpVideoUploadService;

		public UploadController(CloudinaryService cloudinaryService, FtpVideoUploadService ftpVideoUploadService)
		{
			_cloudinaryService = cloudinaryService;
			_ftpVideoUploadService = ftpVideoUploadService;
		}

		[HttpGet("test-ftp")]
		public async Task<IActionResult> TestFtpConnection()
		{
			try
			{
				var result = await _ftpVideoUploadService.TestConnectionDetailedAsync();

				if (result.success)
				{
					return Ok(new
					{
						message = result.message,
						status = "success",
						details = result.details
					});
				}
				else
				{
					return BadRequest(new
					{
						message = result.message,
						status = "failed",
						details = result.details
					});
				}
			}
			catch (Exception ex)
			{
				return StatusCode(500, new
				{
					message = $"Lỗi khi test FTP: {ex.Message}",
					status = "error",
					stackTrace = ex.ToString()
				});
			}
		}

		[HttpPost("image")]
		public async Task<IActionResult> UploadImage(IFormFile image) // Fixed parameter name
		{
			if (image == null || image.Length == 0)
			{
				return BadRequest(new { message = "Upload failed: No image provided." });
			}

			try
			{
				var imageUrl = await _cloudinaryService.UploadImageAsync(image, "product_images");

				// Create a response object that matches the client's expectation
				var responseData = new[] { new { url = imageUrl } };
				var response = new { data = responseData };

				return Ok(response); // Fixed response structure
			}
			catch (Exception ex)
			{
				// Handle potential upload errors
				return StatusCode(500, new { message = $"Image upload failed: {ex.Message}" });
			}
		}
	}
}
