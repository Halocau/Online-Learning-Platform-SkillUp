using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace SkillUp.Hubs
{
    public class CommentHub : Hub
    {
        // Tham gia group bài viết (để chỉ nhận comment cùng PostId)
        public async Task JoinPostGroup(string postId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, postId);
        }

        // Rời group bài viết
        public async Task LeavePostGroup(string postId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, postId);
        }

        // 👉 Gửi comment realtime tới tất cả client trong group postId
        public async Task SendComment(string postId, string username, string message)
        {
            if (string.IsNullOrWhiteSpace(message)) return;

            // Gửi comment cho tất cả người trong cùng group post
            await Clients.Group(postId).SendAsync("ReceiveComment", username, message);
        }
    }
}
