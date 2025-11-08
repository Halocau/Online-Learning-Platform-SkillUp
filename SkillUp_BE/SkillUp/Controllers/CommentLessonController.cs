// File: /Controllers/CommentLessonController.cs
// (Giống CommentPostController)
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
    public class CommentLessonController : ControllerBase
    {
        private readonly ICommentLessonService _commentService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IHubContext<CommentLessonHub> _hubContext; // Đổi Hub

        public CommentLessonController(
            ICommentLessonService commentService,
            ICurrentUserService currentUserService,
            IHubContext<CommentLessonHub> hubContext) // Đổi Hub
        {
            _commentService = commentService;
            _currentUserService = currentUserService;
            _hubContext = hubContext;
        }

        [HttpGet("GetByLesson/{lessonId}")] // Đổi
        public async Task<IActionResult> GetByLesson(Guid lessonId) // Đổi
        {
            var comments = await _commentService.GetCommentsByLessonIdAsync(lessonId); // Đổi
            return Ok(new { code = 200, message = "Lấy danh sách comment thành công", data = comments });
        }

        [Authorize]
        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreateCommentLessonDto dto) // Đổi DTO
        {
            if (_currentUserService.UserId == null)
                return BadRequest(new { code = 400, message = "Người dùng chưa đăng nhập" });

            var accountId = _currentUserService.UserId.Value;

            var comment = await _commentService.CreateCommentAsync(dto, accountId); // Đổi DTO

            // Đổi Group Name và Tên sự kiện
            await _hubContext.Clients.Group($"Lesson_{dto.LessonId.ToString()}")
                .SendAsync("ReceiveLessonComment", comment);

            return Ok(new { code = 200, message = "Tạo comment thành công", data = comment });
        }

        [Authorize]
        [HttpPut("Update")]
        public async Task<IActionResult> Update([FromBody] UpdateCommentLessonDto dto) // Đổi DTO
        {
            if (_currentUserService.UserId == null)
                return BadRequest(new { code = 400, message = "Người dùng chưa đăng nhập" });

            var accountId = _currentUserService.UserId.Value;

            try
            {
                var updated = await _commentService.UpdateCommentAsync(dto, accountId); // Đổi DTO

                // Đổi Group Name và Tên sự kiện
                await _hubContext.Clients.Group($"Lesson_{updated.LessonId.ToString()}")
                       .SendAsync("UpdateLessonComment", updated);

                return Ok(new { code = 200, message = "Cập nhật comment thành công", data = updated });
            }
            catch (UnauthorizedAccessException) { return Forbid(); }
            catch (Exception ex) { return BadRequest(new { code = 400, message = ex.Message }); }
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

                // Đổi Group Name và Tên sự kiện
                await _hubContext.Clients.Group($"Lesson_{deletedComment.LessonId.ToString()}")
                       .SendAsync("DeleteLessonComment", deletedComment.Id);

                return Ok(new { code = 200, message = "Xóa comment thành công", data = new { id = deletedComment.Id } });
            }
            catch (UnauthorizedAccessException) { return Forbid(); }
            //catch (Exception ex) { return BadRequest(new { code = 400, message: ex.Message }); }
        }
    }
}