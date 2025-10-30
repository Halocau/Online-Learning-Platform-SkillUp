using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SkillUp.Services.Interfaces;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SkillUp.Hubs
{
    [Authorize]
    public class LikeCommentHub : Hub
    {
        private readonly ILikeCommentPostService _likeService;

        public LikeCommentHub(ILikeCommentPostService likeService)
        {
            _likeService = likeService;
        }

        public async Task JoinCommentGroup(string commentId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, commentId);
        }

        public async Task LeaveCommentGroup(string commentId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, commentId);
        }

        // Client gọi ToggleLike realtime (nếu muốn dùng hub trực tiếp)
        public async Task ToggleLike(string commentId)
        {
            var accountIdStr = Context.User?.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(accountIdStr))
                throw new HubException("Không tìm thấy AccountId trong token");

            if (!Guid.TryParse(accountIdStr, out var accountId))
                throw new HubException("AccountId không hợp lệ");

            if (!Guid.TryParse(commentId, out var commentGuid))
                throw new HubException("CommentId không hợp lệ");

            var total = await _likeService.LikeOrUnlikeCommentAsync(accountId, commentGuid);

            await Clients.Group(commentId).SendAsync("ReceiveLikeUpdate", commentId, total);
        }
    }
}
