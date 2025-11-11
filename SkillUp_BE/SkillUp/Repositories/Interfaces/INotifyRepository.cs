using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface INotifyRepository
    {
        Task<Notify> CreateAsync(Notify notification);
        Task<IEnumerable<Notify>> GetByAccountIdAsync(Guid accountId);

        Task<IEnumerable<Notify>> GetAllAsync();
    }
}