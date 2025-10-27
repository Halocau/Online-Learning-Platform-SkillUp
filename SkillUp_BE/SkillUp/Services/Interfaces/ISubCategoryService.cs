using SkillUp.BussinessObjects.DTOs;

namespace SkillUp.Services.Interfaces
{
    public interface ISubCategoryService
    {
        Task<IEnumerable<SubCategoryDto>> GetAllSubCategoriesAsync();
        Task<SubCategoryDto> CreateSubCategoryAsync(SubCategoryCreateRequest request);
        Task<SubCategoryDto?> GetSubCategoryByIdAsync(int id);
        Task UpdateSubCategoryAsync(int id, SubCategoryUpdateRequest request);
        Task DeleteSubCategoryAsync(int id);
    }
}
