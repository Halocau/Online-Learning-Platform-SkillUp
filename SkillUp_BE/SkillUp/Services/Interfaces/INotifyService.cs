using SkillUp.BussinessObjects.DTOs.NotifyDto;

namespace SkillUp.Services.Interfaces
{
    public interface INotifyService
    {
        Task CreateNotificationAsync(Guid recipientAccountId, string title, string contents);

        Task<IEnumerable<NotifyDto>> GetMyNotificationsAsync();

        Task<IEnumerable<NotifyDto>> GetNotificationsByAccountIdAsync(Guid accountId);
        Task<IEnumerable<NotifyDto>> GetAllNotificationsAsync();
        Task<bool> MarkAsReadAsync(Guid notificationId, Guid accountId);
        Task<bool> MarkAllAsReadAsync(Guid accountId);
        Task<int> CreateSystemNotificationAsync(CreateSystemNotificationDto dto);
    }
}