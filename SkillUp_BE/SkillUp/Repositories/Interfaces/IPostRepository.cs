using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IPostRepository
    {
        Task<Post> CreateAsync(Post post);
        Task<Post?> GetByIdAsync(Guid id);
        Task<IEnumerable<Post>> GetAllAsync();
        Task<IEnumerable<Post>> GetActiveAsync();
        Task<IEnumerable<Post>> GetByUserAsync(Guid userId, bool includeInactive);
        Task UpdateAsync(Post post);
        Task DeleteAsync(Post post);
        Task SaveAsync();
    }
}
