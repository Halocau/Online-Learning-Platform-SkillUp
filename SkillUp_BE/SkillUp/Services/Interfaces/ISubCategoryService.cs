
using SkillUp.BussinessObjects.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SkillUp.Services.Interfaces
{
    public interface ISubCategoryService
    {
        Task<IEnumerable<SubCategoryDto>> GetAllAsync();
        Task<SubCategoryDto?> GetByIdAsync(int id);
        Task<SubCategoryDto> CreateAsync(SubCategoryDto dto);
        Task<bool> UpdateAsync(int id, SubCategoryDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
