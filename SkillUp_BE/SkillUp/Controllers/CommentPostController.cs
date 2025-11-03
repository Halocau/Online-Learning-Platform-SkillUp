using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SkillUp.BussinessObjects.DTOs.Comment;
using SkillUp.Hubs;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CommentPostController : ControllerBase
    {
        private readonly ICommentPostService _commentService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IHubContext<CommentHub> _hubContext;

        public CommentPostController(
            ICommentPostService commentService,
            ICurrentUserService currentUserService,
            IHubContext<CommentHub> hubContext)
        {
            _commentService = commentService;
            _currentUserService = currentUserService;
            _hubContext = hubContext;
        }

        [HttpGet("GetByPost/{postId}")]
        public async Task<IActionResult> GetByPost(Guid postId)
        {
            var comments = await _commentService.GetCommentsByPostIdAsync(postId);
            return Ok(new { code = 200, message = "Lấy danh sách comment thành công", data = comments });
        }

        [Authorize]
        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreateCommentDto dto)
        {
            if (_currentUserService.UserId == null)
                return BadRequest(new { code = 400, message = "Người dùng chưa đăng nhập" });

            var accountId = _currentUserService.UserId.Value;

            var comment = await _commentService.CreateCommentAsync(dto, accountId);

            await _hubContext.Clients.Group(dto.PostId.ToString())
                .SendAsync("ReceiveComment", comment);

            return Ok(new
            {
                code = 200,
                message = "Tạo comment thành công",
                data = comment
            });
        }

        [Authorize]
        [HttpPut("Update")]
        public async Task<IActionResult> Update([FromBody] UpdateCommentDto dto)
        {
            if (_currentUserService.UserId == null)
                return BadRequest(new { code = 400, message = "Người dùng chưa đăng nhập" });

            var accountId = _currentUserService.UserId.Value;

            try
            {
                var updated = await _commentService.UpdateCommentAsync(dto, accountId);

                // Gửi realtime qua SignalR
                await _hubContext.Clients.Group(updated.PostId.ToString())
                    .SendAsync("UpdateComment", updated);

                return Ok(new
                {
                    code = 200,
                    message = "Cập nhật comment thành công",
                    data = updated
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }

        [Authorize]
        [HttpDelete("Delete/{commentId}")]
        public async Task<IActionResult> Delete(Guid commentId)
        {
            if (_currentUserService.UserId == null)
                return BadRequest(new { code = 400, message = "Người dùng chưa đăng nhập" });

            var accountId = _currentUserService.UserId.Value;

            try
            {
                var deletedComment = await _commentService.DeleteCommentAsync(commentId, accountId);

                // Gửi realtime qua SignalR (chỉ cần gửi Id)
                await _hubContext.Clients.Group(deletedComment.PostId.ToString())
                    .SendAsync("DeleteComment", deletedComment.Id);

                return Ok(new
                {
                    code = 200,
                    message = "Xóa comment thành công",
                    data = new { id = deletedComment.Id } // Trả về Id của comment đã xóa
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid(); // 403
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message }); // 400
            }
        }
    }
}
