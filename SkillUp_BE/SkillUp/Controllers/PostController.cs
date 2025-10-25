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

        private Guid GetUserId()
        {
            var userId = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) throw new Exception("User ID not found in token");
            return Guid.Parse(userId);
        }

        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreatePost([FromForm] PostCreateRequest request)
        {
            var result = await _postService.CreatePostAsync(request, GetUserId());
            return Ok(result);
        }

        [Authorize]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdatePost(Guid id, [FromForm] PostUpdateRequest request)
        {
            var result = await _postService.UpdatePostAsync(id, request, GetUserId());
            return Ok(result);
        }

        [Authorize]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeletePost(Guid id)
        {
            var result = await _postService.DeletePostAsync(id, GetUserId());
            return Ok(result);
        }

        [HttpGet("view-all")]
        public async Task<IActionResult> ViewAll() => Ok(await _postService.ViewAllPostsAsync());

        [HttpGet("view-active")]
        public async Task<IActionResult> ViewActive() => Ok(await _postService.ViewActivePostsAsync());

        [HttpGet("user/{accountId}")]
        public async Task<IActionResult> ViewUser(Guid accountId, [FromQuery] bool includeInactive = false)
            => Ok(await _postService.ViewUserPostsAsync(accountId, includeInactive));
    }
}
