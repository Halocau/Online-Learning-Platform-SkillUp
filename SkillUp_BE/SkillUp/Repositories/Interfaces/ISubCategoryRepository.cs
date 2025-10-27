using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ISubCategoryRepository
    {
        Task<IEnumerable<SubCategory>> GetAllActiveAsync();
        Task<SubCategory?> GetByIdAsync(int id);
        Task<SubCategory?> GetByNameAsync(string name);
        Task<SubCategory> CreateAsync(SubCategory subCategory);
        Task UpdateAsync(SubCategory subCategory);
        Task DeleteAsync(SubCategory subCategory);
        Task SaveChangesAsync();
    }
}
