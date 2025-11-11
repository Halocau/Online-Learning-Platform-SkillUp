using Microsoft.AspNetCore.SignalR;
//using SkillUp.BussinessObjects.DTOs.NotifyDto;
using SkillUp.BussinessObjects.DTOs.NotifyDto;
using SkillUp.BussinessObjects.Models;
using SkillUp.Hubs;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using System.Security.Authentication;

namespace SkillUp.Services.Implementations
{
    public class NotifyService : INotifyService
    {
        private readonly INotifyRepository _notifyRepo;
        private readonly IHubContext<NotificationHub> _notifyHubContext;
        private readonly ICurrentUserService _currentUserService;

        public NotifyService(
            INotifyRepository notifyRepo,
            IHubContext<NotificationHub> notifyHubContext,
            ICurrentUserService currentUserService)
        {
            _notifyRepo = notifyRepo;
            _notifyHubContext = notifyHubContext;
            _currentUserService = currentUserService;
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

        public async Task<IEnumerable<NotifyDto>> GetMyNotificationsAsync()
        {
            var accountId = _currentUserService.UserId;
            if (accountId == null)
            {
                throw new AuthenticationException("Người dùng chưa đăng nhập.");
            }
            var notifications = await _notifyRepo.GetByAccountIdAsync(accountId.Value);
            return MapToDto(notifications);
        }

        // --- HÀM MỚI 1 (Cho Admin) ---
        public async Task<IEnumerable<NotifyDto>> GetNotificationsByAccountIdAsync(Guid accountId)
        {
            var notifications = await _notifyRepo.GetByAccountIdAsync(accountId);
            return MapToDto(notifications);
        }

        // --- HÀM MỚI 2 (Cho Admin) ---
        public async Task<IEnumerable<NotifyDto>> GetAllNotificationsAsync()
        {
            var notifications = await _notifyRepo.GetAllAsync();
            return MapToDto(notifications);
        }

        // --- HÀM HELPER (Tái sử dụng code map) ---
        private IEnumerable<NotifyDto> MapToDto(IEnumerable<Notify> notifications)
        {
            return notifications.Select(n => new NotifyDto
            {
                Id = n.Id,
                AccountId = n.AccountId,
                Title = n.Title,
                Contents = n.Contents,
                Status = n.Status,
                CreatedAt = n.CreatedAt
            });
        }
    }
}