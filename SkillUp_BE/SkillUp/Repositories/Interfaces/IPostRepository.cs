// Repositories/Interfaces/IPostRepository.cs
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IPostRepository
    {
        Task<Post> CreateAsync(Post post);
        Task<List<Post>> GetAllAsync();
        Task<List<Post>> GetActiveAsync();
        Task<List<Post>> GetByAccountIdAsync(Guid accountId, bool includeInactive);
        Task<Post?> GetByIdAsync(Guid id);
    }
}
