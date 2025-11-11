namespace SkillUp.Services.Interfaces
{
    public interface INotifyService
    {
        Task CreateNotificationAsync(Guid recipientAccountId, string title, string contents);
    }
}