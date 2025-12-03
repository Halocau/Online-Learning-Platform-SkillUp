using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Common;

namespace SkillUp.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class UploadController : ControllerBase
	{
		private readonly ICloudinaryService _cloudinaryService;
		private readonly FtpVideoUploadService _ftpVideoUploadService;

		public UploadController(ICloudinaryService cloudinaryService, FtpVideoUploadService ftpVideoUploadService)
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
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadImage(IFormFile image)
        {
            if (image == null || image.Length == 0)
            {
                return BadRequest(new APIReturn { code = 400, message = "Upload thất bại: Không có file nào được chọn." });
            }

            try
            {
                var imageUrl = await _cloudinaryService.UploadImageAsync(image, "skillup/questions");

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Tải ảnh lên thành công",
                    data = new List<object> { new { url = imageUrl } }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn { code = 500, message = $"Image upload failed: {ex.Message}" });
            }
        }
    }
}
