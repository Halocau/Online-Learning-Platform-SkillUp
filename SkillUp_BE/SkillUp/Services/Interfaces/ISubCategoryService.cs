using SkillUp.BussinessObjects.DTOs;
using SkillUp.ExceptionHandling;

public interface ISubCategoryService
{
    Task<IEnumerable<SubCategoryDto>> GetAllSubCategoriesAsync();
    Task<SubCategoryDto?> GetSubCategoryByIdAsync(int id);

    Task<APIReturn> CreateSubCategoryAsync(SubCategoryCreateRequest request); 
    //Task UpdateSubCategoryAsync(int id, SubCategoryUpdateRequest request);
    Task DeleteSubCategoryAsync(int id);
    Task<APIReturn> UpdateSubCategoryAsync(int id, SubCategoryUpdateRequest request);
}
