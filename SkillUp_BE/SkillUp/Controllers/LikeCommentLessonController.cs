// File: /Controllers/LikeCommentLessonController.cs

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SkillUp.BussinessObjects.DTOs.Like;
using SkillUp.Hubs;
using SkillUp.Repositories.Interfaces; // Cần repo để lấy LessonId
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LikeCommentLessonController : ControllerBase
    {
        private readonly ILikeCommentLessonService _likeService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IHubContext<CommentLessonHub> _hubContext;
        private readonly ICommentLessonRepository _commentRepo; // Dùng để lấy LessonId

        public LikeCommentLessonController(
            ILikeCommentLessonService likeService,
            ICurrentUserService currentUserService,
            IHubContext<CommentLessonHub> hubContext,
            ICommentLessonRepository commentRepo) // Tiêm repo
        {
            _likeService = likeService;
            _currentUserService = currentUserService;
            _hubContext = hubContext;
            _commentRepo = commentRepo;
        }

        [Authorize]
        [HttpPost("Toggle/{commentLessonId}")]
        public async Task<IActionResult> ToggleLike(Guid commentLessonId)
        {
            if (_currentUserService.UserId == null)
                return Unauthorized(new { code = 401, message = "Người dùng chưa đăng nhập" });

            var accountId = _currentUserService.UserId.Value;

            try
            {
                // 1. Gọi Service để xử lý Like/Unlike
                var response = await _likeService.ToggleLikeAsync(commentLessonId, accountId);

                // 2. Gửi thông báo Real-time
                // 2A. Lấy LessonId từ comment
                var comment = await _commentRepo.GetByIdAsync(commentLessonId);
                if (comment != null)
                {
                    // 2B. Gửi thông báo tới group của bài học
                    await _hubContext.Clients.Group($"Lesson_{comment.LessonId.ToString()}")
                        .SendAsync("UpdateLikeCount", response);
                    // Client sẽ lắng nghe sự kiện "UpdateLikeCount"
                }

                // 3. Trả về kết quả
                return Ok(new { code = 200, message = "Thao tác thành công", data = response });
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }

        [HttpGet("GetStatusesForLesson/{lessonId}")]
        public async Task<IActionResult> GetStatusesForLesson(Guid lessonId)
        {
            // Lấy ID người dùng (có thể là null nếu chưa đăng nhập)
            var accountId = _currentUserService.UserId;

            try
            {
                var response = await _likeService.GetLikeStatusesForLessonAsync(lessonId, accountId);
                return Ok(new { code = 200, message = "Lấy trạng thái like thành công", data = response });
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }

        [HttpGet("GetStatusForComment/{commentLessonId}")]
        public async Task<IActionResult> GetStatusForComment(Guid commentLessonId)
        {
            // Lấy ID người dùng (có thể là null nếu chưa đăng nhập)
            var accountId = _currentUserService.UserId;

            try
            {
                var response = await _likeService.GetLikeStatusForCommentAsync(commentLessonId, accountId);
                return Ok(new { code = 200, message = "Lấy trạng thái like thành công", data = response });
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }
    }
}