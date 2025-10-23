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

		public UploadController(CloudinaryService cloudinaryService)
		{
			_cloudinaryService = cloudinaryService;
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
