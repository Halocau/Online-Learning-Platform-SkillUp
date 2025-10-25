using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Post;
using SkillUp.Services.Interfaces;
using System.Security.Claims;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostController : ControllerBase
    {
        private readonly IPostService _postService;

        public PostController(IPostService postService)
        {
            _postService = postService;
        }

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreatePost([FromForm] PostCreateRequest request)
        {
            var userId = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User ID not found in token");

            if (!Guid.TryParse(userId, out Guid accountId))
                return BadRequest("Invalid user ID format");

            var result = await _postService.CreatePostAsync(request, accountId);
            return Ok(new { message = "Post created successfully", data = result });
        }

        [HttpGet("view-all")]
        public async Task<IActionResult> ViewAll() =>
            Ok(await _postService.ViewAllPostsAsync());

        [HttpGet("view-active")]
        public async Task<IActionResult> ViewActive() =>
            Ok(await _postService.ViewActivePostsAsync());

        [HttpGet("user/{accountId}")]
        public async Task<IActionResult> ViewUser(Guid accountId, [FromQuery] bool includeInactive = false) =>
            Ok(await _postService.ViewUserPostsAsync(accountId, includeInactive));
    }
}
