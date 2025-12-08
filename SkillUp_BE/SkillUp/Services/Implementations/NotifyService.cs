using Microsoft.AspNetCore.SignalR;
//using SkillUp.BussinessObjects.DTOs.NotifyDto;
using SkillUp.BussinessObjects.DTOs.NotifyDto;
using SkillUp.BussinessObjects.Models;
using SkillUp.Hubs;
using SkillUp.Repositories.Implementations;
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
        private readonly IAccountRepository _accountRepository;
        private readonly IEnrollmentRepository _enrollmentRepo;

        public NotifyService(
            INotifyRepository notifyRepo,
            IHubContext<NotificationHub> notifyHubContext,
            ICurrentUserService currentUserService ,
            IAccountRepository accountRepository,
            IEnrollmentRepository enrollmentRepo)
        {
            _notifyRepo = notifyRepo;
            _notifyHubContext = notifyHubContext;
            _currentUserService = currentUserService;
            _accountRepository = accountRepository;
            _enrollmentRepo = enrollmentRepo;
        }

        public async Task CreateNotificationAsync(Guid recipientAccountId, string title, string contents, string? hyperlink = null)
        {
            // 1. Tạo và lưu thông báo vào DB
            var notification = new Notify
            {
                Id = Guid.NewGuid(),
                AccountId = recipientAccountId,
                Title = title,
                Contents = contents,
                Status = "Unread",
                CreatedAt = DateTime.Now,
                Hyperlink = hyperlink
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
                CreatedAt = savedNotify.CreatedAt,
                Hyperlink = savedNotify.Hyperlink
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
                CreatedAt = n.CreatedAt,
                Hyperlink = n.Hyperlink
            });
        }
        public async Task<bool> MarkAsReadAsync(Guid notificationId, Guid accountId)
        {
            // 1. Tìm thông báo
            var notification = await _notifyRepo.GetByIdAsync(notificationId);

            // 2. Kiểm tra
            if (notification == null) return false;
            if (notification.AccountId != accountId)
                throw new UnauthorizedAccessException("Bạn không sở hữu thông báo này.");

            // 3. Cập nhật Status
            notification.Status = "Read"; // Sửa status thành Read

            // 4. Lưu
            await _notifyRepo.UpdateAsync(notification);
            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(Guid accountId)
        {

            var unreadNotifications = await _notifyRepo.GetUnreadByAccountIdAsync(accountId);

            if (!unreadNotifications.Any()) return false;

            foreach (var noti in unreadNotifications)
            {
                noti.Status = "Read";
            }

            await _notifyRepo.UpdateRangeAsync(unreadNotifications);
            return true;
        }
        public async Task<int> CreateSystemNotificationAsync(CreateSystemNotificationDto dto)
        {

            var userIds = await _accountRepository.GetAllActiveAccountIdsAsync();

            if (!userIds.Any()) return 0;

            var notificationList = new List<Notify>();
            var now = DateTime.Now;

            foreach (var userId in userIds)
            {
                notificationList.Add(new Notify
                {
                    Id = Guid.NewGuid(),
                    AccountId = userId,
                    Title = dto.Title,
                    Contents = dto.Contents,
                    Status = "Unread",
                    CreatedAt = now,
                    Hyperlink = dto.Hyperlink
                });
            }

            await _notifyRepo.AddRangeAsync(notificationList);
            await _notifyRepo.SaveChangesAsync();
            return notificationList.Count; 
        }
        public async Task SendCourseUpdateNotificationAsync(Guid courseId, string title, string message, string? link = null)
        {
            var studentAccountIds = await _enrollmentRepo.GetStudentAccountIdsByCourseIdAsync(courseId);

            if (!studentAccountIds.Any()) return;
            var notifications = new List<Notify>();
            var now = DateTime.Now;
            var targetLink = link ?? $"/course/{courseId}";

            foreach (var accId in studentAccountIds)
            {
                notifications.Add(new Notify
                {
                    Id = Guid.NewGuid(),
                    AccountId = accId,
                    Title = title,
                    Contents = message,
                    Status = "Unread",
                    CreatedAt = now,
                    Hyperlink = targetLink
                });
            }
            await _notifyRepo.CreateRangeAsync(notifications);
        }
    }
}