using SkillUp.BussinessObjects.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SkillUp.Services.Interfaces
{
    public interface ISubCategoryService
    {
        Task<IEnumerable<SubCategoryDto>> GetAllSubCategoriesAsync();
        Task<SubCategoryDto?> GetSubCategoryByIdAsync(int id);
        Task<SubCategoryDto> CreateSubCategoryAsync(SubCategoryDto dto);
        Task<bool> UpdateSubCategoryAsync(int id, SubCategoryDto dto);
        Task<bool> DeleteSubCategoryAsync(int id);
    }
}
