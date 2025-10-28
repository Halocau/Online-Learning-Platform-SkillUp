using SkillUp.BussinessObjects.DTOs.Course;
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
        Task<List<CourseMorderatorResponseDto>> GetAllCourseAsync(Guid accountId);
    }
}
