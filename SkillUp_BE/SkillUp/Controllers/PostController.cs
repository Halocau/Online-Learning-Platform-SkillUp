using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.DTOs.Post;
using SkillUp.BussinessObjects.Models;
using SkillUp.Services.Interfaces;
using System.Security.Claims;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostController : ControllerBase
    {
        private readonly IPostService _postService;
        private readonly SkillUpContext _context;

        public PostController(IPostService postService, SkillUpContext context)
        {
            _postService = postService;
            _context = context;
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

        // 🟢 Edit post
        [Authorize]
        [HttpPut("edit/{postId}")]
        public async Task<IActionResult> EditPost(Guid postId, [FromForm] PostEditRequest request)
        {
            var userId = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User ID not found in token");

            var accountId = Guid.Parse(userId);
            var result = await _postService.EditPostAsync(postId, request, accountId);
            return Ok(new { message = "Post updated successfully", data = result });
        }

        // 🔴 Delete post (chuyển status thành inactive)
        [Authorize]
        [HttpDelete("delete/{postId}")]
        public async Task<IActionResult> DeletePost(Guid postId)
        {
            var userId = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("User ID not found in token");

            var accountId = Guid.Parse(userId);
            var result = await _postService.DeletePostAsync(postId, accountId);
            return Ok(new { message = "Post deleted successfully", data = result });
        }
        [HttpGet("{postId}")]
        public async Task<IActionResult> GetPostById(Guid postId)
        {
            var post = await _context.Posts
                .Include(p => p.ForumCategory)
                .Include(p => p.CommentPosts)
                .Include(p => p.PostImages)
                .Include(p => p.Account)
                .FirstOrDefaultAsync(p => p.Id == postId);

            if (post == null)
                return NotFound(new { message = "Post not found" });

            var dto = new PostDto
            {
                Id = post.Id,
                AccountId = post.AccountId,
                ForumCategoryId = post.ForumCategoryId,
                Title = post.Title,
                Contents = post.Contents,
                CreatedAt = post.CreatedAt,
                UpdatedAt = post.UpdatedAt,
                Status = post.Status,
                AccountName = post.Account.Email, // or FullName if exists
                ForumCategoryName = post.ForumCategory.Name,
                CommentCount = post.CommentPosts.Count,
                PostImageUrls = post.PostImages.Select(pi => pi.ImageUrl).ToList()
            };

            return Ok(new { message = "Get post detail successfully", data = dto });
        }
    }
}
