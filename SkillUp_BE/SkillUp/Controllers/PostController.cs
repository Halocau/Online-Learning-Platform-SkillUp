using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Post;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;
using System.Security.Claims;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostController : ControllerBase
    {
        private readonly IPostService _postService;
        private readonly ICurrentUserService _currentUserService;

        public PostController(IPostService postService, ICurrentUserService currentUserService)
        {
            _postService = postService;
            _currentUserService = currentUserService;
        }

        // ✅ Lấy userId từ token
        private Guid GetUserId()
        {
            var userId = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                throw new Exception("User ID not found in token");

            return Guid.Parse(userId);
        }

        // ✅ Tạo bài viết
        [Authorize]
        [HttpPost("create")]
        public async Task<IActionResult> CreatePost([FromForm] PostCreateRequest request)
        {
            try
            {
                 var userId = _currentUserService.UserId;
                var result = await _postService.CreatePostAsync(request, GetUserId());
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Post created successfully",
                    data = new List<object> { result }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = ex.Message,
                    data = new List<object>()
                });
            }
        }

        // ✅ Cập nhật bài viết
        [Authorize]
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdatePost(Guid id, [FromForm] PostUpdateRequest request)
        {
            try
            {
                var result = await _postService.UpdatePostAsync(id, request, GetUserId());
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Post updated successfully",
                    data = new List<object> { result }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = ex.Message,
                    data = new List<object>()
                });
            }
        }

        // ✅ Xóa (ẩn) bài viết
        [Authorize]
        [HttpPut("delete/{id}")]
        public async Task<IActionResult> DeletePost(Guid id)
        {
            try
            {
                var result = await _postService.DeletePostAsync(id, GetUserId());
                return Ok(new APIReturn
                {
                    code = 200,
                    message = result ? "Post deleted successfully" : "Failed to delete post",
                    data = new List<object>()
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = ex.Message,
                    data = new List<object>()
                });
            }
        }

        // ✅ Xem toàn bộ bài viết (bao gồm inactive)
        [HttpGet("view-all")]
        public async Task<IActionResult> ViewAll()
        {
            try
            {
                var result = await _postService.ViewAllPostsAsync();
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Fetched all posts successfully",
                    data = result.Cast<object>().ToList()
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = ex.Message,
                    data = new List<object>()
                });
            }
        }

        // ✅ Xem các bài viết đang active
        [HttpGet("view-active")]
        public async Task<IActionResult> ViewActive()
        {
            try
            {
                var result = await _postService.ViewActivePostsAsync();
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Fetched active posts successfully",
                    data = result.Cast<object>().ToList()
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = ex.Message,
                    data = new List<object>()
                });
            }
        }

        // ✅ Xem bài viết của 1 người dùng cụ thể
        [HttpGet("user/{accountId}")]
        public async Task<IActionResult> ViewUser(Guid accountId, [FromQuery] bool includeInactive = false)
        {
            try
            {
                var result = await _postService.ViewUserPostsAsync(accountId, includeInactive);
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Fetched user posts successfully",
                    data = result.Cast<object>().ToList()
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = ex.Message,
                    data = new List<object>()
                });
            }
        }

        // ✅ Lấy bài viết theo Id
        [HttpGet("ViewPostbyId/{id}")]
        public async Task<IActionResult> GetPostById(Guid id)
        {
            try
            {
                var result = await _postService.GetPostByIdAsync(id);
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Fetched post successfully",
                    data = new List<object> { result }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = ex.Message,
                    data = new List<object>()
                });
            }
        }

        [Authorize(Roles = "Content Morderator")] 
        [HttpPut("ban/{id}")]
        public async Task<IActionResult> BanPost(Guid id)
        {
            try
            {
                await _postService.BanPostAsync(id);
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Post banned successfully",
                    data = new List<object>()
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = ex.Message,
                    data = new List<object>()
                });
            }
        }

        // ✅ Unban bài viết (chỉ Moderator)
        [Authorize(Roles = "Content Morderator")] 
        [HttpPut("unban/{id}")]
        public async Task<IActionResult> UnbanPost(Guid id)
        {
            try
            {
                await _postService.UnbanPostAsync(id);
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Post unbanned successfully",
                    data = new List<object>()
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = ex.Message,
                    data = new List<object>()
                });
            }
        }

    }
}
