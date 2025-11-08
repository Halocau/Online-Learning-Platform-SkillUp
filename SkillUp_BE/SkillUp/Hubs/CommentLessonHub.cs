// File: /Hubs/CommentLessonHub.cs
// (Giống CommentHub)
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace SkillUp.Hubs
{
    public class CommentLessonHub : Hub
    {
        // Đổi tên hàm cho rõ ràng
        public async Task JoinLessonGroup(string lessonId)
        {
            // Thêm prefix "Lesson_" để tránh trùng lặp group
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Lesson_{lessonId}");
        }

        public async Task LeaveLessonGroup(string lessonId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Lesson_{lessonId}");
        }
    }
}