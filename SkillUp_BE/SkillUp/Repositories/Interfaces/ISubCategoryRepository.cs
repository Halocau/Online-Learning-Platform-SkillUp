using SkillUp.BussinessObjects.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SkillUp.Repositories.Interfaces
{
    public interface ISubCategoryRepository
    {
        Task<IEnumerable<SubCategory>> GetAllSubCategoriesAsync();
        Task<SubCategory?> GetSubCategoryByIdAsync(int id);
        Task AddSubCategoryAsync(SubCategory subCategory);
        Task UpdateSubCategoryAsync(SubCategory subCategory);
        Task SaveChangesAsync();
    }
}
