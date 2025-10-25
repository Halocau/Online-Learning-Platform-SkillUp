using SkillUp.BussinessObjects.DTOs.Course;
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
    public interface ICourseService
    {
        Task<CourseResponseDto?> CreateDraftCourseAsync(CreateCourseDto request , Guid accId);
    }
}
