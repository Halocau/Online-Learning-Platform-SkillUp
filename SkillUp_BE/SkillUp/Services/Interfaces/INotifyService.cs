using SkillUp.BussinessObjects.DTOs.NotifyDto;

namespace SkillUp.Services.Interfaces
{
    public interface INotifyService
    {
        Task CreateNotificationAsync(Guid recipientAccountId, string title, string contents);

        Task<IEnumerable<NotifyDto>> GetMyNotificationsAsync();

        Task<IEnumerable<NotifyDto>> GetNotificationsByAccountIdAsync(Guid accountId);
        Task<IEnumerable<NotifyDto>> GetAllNotificationsAsync();
    }
}