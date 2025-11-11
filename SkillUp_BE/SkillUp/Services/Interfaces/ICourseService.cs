using SkillUp.BussinessObjects.DTOs.Course;
using SkillUp.BussinessObjects.DTOs.CourseByCategoryPage;
using SkillUp.BussinessObjects.Models;
using System.Threading.Tasks;

namespace SkillUp.Services.Interfaces
{
    public interface ICourseService
    {
        Task<CourseResponseDto?> CreateDraftCourseAsync(CreateUpdateCourseDto request , Guid accId);
        Task<CourseResponseDto?> UpdateCourseAsync(CreateUpdateCourseDto request , Guid courseId , Guid accountId);
        Task<bool> DeleteCourseAsync(Guid courseId, Guid accountId);
        Task<bool> ToggleBanCourseAsync(Guid courseId, Guid adminAccountId);
        Task<List<CourseSummaryDTO>> GetListCourseBySubCateId(int id);
        Task<List<CourseSummaryDTO>> GetListCourseByCateId(int id);
        Task<List<CourseMorderatorResponseDto>> GetAllCourseAsync(Guid accountId);
        Task<List<CourseLecturerResponseDto>> GetCoursesOfLecturerByAccountId(Guid accountId);
        Task<CourseDetailDto> GetCourseDetailsAsync(Guid courseId);
        Task<CategoryPageDto> GetCategoryPageAsync(int categoryId);
    }
}
