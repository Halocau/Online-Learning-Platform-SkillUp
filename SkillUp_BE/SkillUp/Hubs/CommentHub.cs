using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace SkillUp.Hubs
{
    public class CommentHub : Hub
    {
        // Gửi comment mới đến tất cả client trong group (bài post)
        public async Task SendComment(string postId, string userName, string commentContent)
        {
            await Clients.Group(postId).SendAsync("ReceiveComment", userName, commentContent);
        }

        // Tham gia group của 1 bài post
        public async Task JoinPost(string postId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, postId);
        }

        // Rời group khi user thoát khỏi bài viết
        public async Task LeavePost(string postId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, postId);
        }
    }
}
