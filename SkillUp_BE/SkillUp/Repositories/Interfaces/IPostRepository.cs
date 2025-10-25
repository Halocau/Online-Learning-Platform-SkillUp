using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IPostRepository
    {
        Task<Post?> GetByIdAsync(Guid id);
        Task AddAsync(Post post);
        Task UpdateAsync(Post post);
        Task<List<Post>> GetAllAsync();
        Task<List<Post>> GetActiveAsync();
        Task<List<Post>> GetByUserIdAsync(Guid accountId, bool includeInactive);
        Task SaveChangesAsync();
    }
}
