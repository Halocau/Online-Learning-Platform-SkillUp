using SkillUp.BussinessObjects.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SkillUp.Repositories.Interfaces
{
    public interface ISubCategoryRepository
    {
        Task<IEnumerable<SubCategory>> GetAllAsync();
        Task<SubCategory?> GetByIdAsync(int id);
        Task AddAsync(SubCategory subCategory);
        Task UpdateAsync(SubCategory subCategory);
        Task SaveChangesAsync();
    }
}
