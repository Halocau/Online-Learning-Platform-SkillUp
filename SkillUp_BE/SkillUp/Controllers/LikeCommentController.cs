using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using SkillUp.Hubs;
using SkillUp.Services.Interfaces;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SkillUp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LikeCommentPostController : ControllerBase
    {
        private readonly ILikeCommentPostService _likeService;
        private readonly IHubContext<LikeCommentHub> _hubContext;

        public LikeCommentPostController(ILikeCommentPostService likeService, IHubContext<LikeCommentHub> hubContext)
        {
            _likeService = likeService;
            _hubContext = hubContext;
        }

        // POST /api/LikeCommentPost/toggle/{commentPostId}
        [HttpPost("toggle/{commentPostId}")]
        public async Task<IActionResult> ToggleLike(Guid commentPostId)
        {
            var accountIdClaim = User?.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(accountIdClaim))
                return Unauthorized(new { message = "Không tìm thấy AccountId trong token" });

            if (!Guid.TryParse(accountIdClaim, out var accountId))
                return BadRequest(new { message = "AccountId không hợp lệ" });

            var totalLikes = await _likeService.LikeOrUnlikeCommentAsync(accountId, commentPostId);

            // Broadcast realtime đến những client đang ở cùng group commentPostId
            await _hubContext.Clients.Group(commentPostId.ToString())
                .SendAsync("ReceiveLikeUpdate", commentPostId.ToString(), totalLikes);

            return Ok(new
            {
                code = 200,
                message = "Like/Unlike thành công",
                data = new { commentPostId, totalLikes }
            });
        }

        // GET /api/LikeCommentPost/count/{commentPostId}
        [AllowAnonymous]
        [HttpGet("count/{commentPostId}")]
        public async Task<IActionResult> GetCount(Guid commentPostId)
        {
            var total = await _likeService.CountLikesAsync(commentPostId);
            return Ok(new { code = 200, commentPostId, totalLikes = total });
        }
    }
}
