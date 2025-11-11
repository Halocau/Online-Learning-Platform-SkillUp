using Microsoft.AspNetCore.SignalR;
//using SkillUp.BussinessObjects.DTOs.NotifyDto;
using SkillUp.BussinessObjects.DTOs.NotifyDto;
using SkillUp.BussinessObjects.Models;
using SkillUp.Hubs;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class NotifyService : INotifyService
    {
        private readonly INotifyRepository _notifyRepo;
        private readonly IHubContext<NotificationHub> _notifyHubContext;

        public NotifyService(
            INotifyRepository notifyRepo,
            IHubContext<NotificationHub> notifyHubContext)
        {
            _notifyRepo = notifyRepo;
            _notifyHubContext = notifyHubContext;
        }

        public async Task CreateNotificationAsync(Guid recipientAccountId, string title, string contents)
        {
            // 1. Tạo và lưu thông báo vào DB
            var notification = new Notify
            {
                Id = Guid.NewGuid(),
                AccountId = recipientAccountId,
                Title = title,
                Contents = contents,
                Status = "Unread",
                CreatedAt = DateTime.Now
            };

            var savedNotify = await _notifyRepo.CreateAsync(notification);

            // 2. Tạo DTO để gửi
            var notifyDto = new NotifyDto
            {
                Id = savedNotify.Id,
                AccountId = savedNotify.AccountId,
                Title = savedNotify.Title,
                Contents = savedNotify.Contents,
                Status = savedNotify.Status,
                CreatedAt = savedNotify.CreatedAt
            };

            // 3. Gửi thông báo realtime đến ĐÚNG group (group có tên là AccountId)
            await _notifyHubContext.Clients
                .Group(recipientAccountId.ToString())
                .SendAsync("ReceiveNotification", notifyDto);
        }
    }
}