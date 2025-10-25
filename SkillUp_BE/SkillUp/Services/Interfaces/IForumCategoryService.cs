using SkillUp.BussinessObjects.DTOs.Category;

namespace SkillUp.Services.Interfaces
{
    public interface IForumCategoryService
    {
        Task<ApiResponse> CreateAsync(ForumCategoryDto dto);
        Task<ApiResponse> UpdateAsync(int id, ForumCategoryDto dto);
        Task<ApiResponse> DeleteAsync(int id);
        Task<ApiResponse> GetAllAsync();
    }
}
