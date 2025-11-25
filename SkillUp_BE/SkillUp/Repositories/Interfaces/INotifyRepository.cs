using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface INotifyRepository
    {
        Task<Notify> CreateAsync(Notify notification);
        Task<IEnumerable<Notify>> GetByAccountIdAsync(Guid accountId);

        Task<IEnumerable<Notify>> GetAllAsync();
        Task<Notify?> GetByIdAsync(Guid id);
        Task UpdateAsync(Notify notification);
        Task<IEnumerable<Notify>> GetUnreadByAccountIdAsync(Guid accountId);
        Task UpdateRangeAsync(IEnumerable<Notify> notifications);

        Task AddRangeAsync(IEnumerable<Notify> notifications);
        Task<bool> SaveChangesAsync();
    }
}