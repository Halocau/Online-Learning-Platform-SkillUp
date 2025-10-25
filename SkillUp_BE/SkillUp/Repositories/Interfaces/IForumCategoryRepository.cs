using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IForumCategoryRepository
    {
        Task<bool> ExistsByNameAsync(string name, int? excludeId = null);
        Task AddAsync(ForumCategory category);
        Task UpdateAsync(ForumCategory category);
        Task<ForumCategory?> GetByIdAsync(int id);
        Task<List<ForumCategory>> GetAllAsync();
    }
}
