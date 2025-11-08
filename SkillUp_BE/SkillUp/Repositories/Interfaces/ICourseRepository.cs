using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ICourseRepository
    {
        Task AddCourseAsync(Course course);
        Task<Course?> GetCourseByIdAsync(Guid courseId);
        Task<bool> SaveChangesAsync();
        void UpdateCourse(Course course);
        Task<List<Course>> GetAllCourseAsync();
        Task<List<Course>> GetCoursesOfLecturer(Guid lecturerId);
        Task<List<Course>> GetPopularCoursesAsync(int limit);
        Task<List<Course>> GetNewestCoursesAsync(int limit);
        Task<List<Course>> GetCoursesBySubCategoryId(int id);
        Task<List<Course>> GetCoursesByCategoryId(int id);
        Task<List<Section>> GetSectionsByCourseIdAsync(Guid courseId);
        Task<Course?> GetCourseWithDetailsAsync(Guid courseId);
        Task<List<Course>> GetCoursesOfLecturerByAccountIdAsync(Guid accountId);

        Task<bool> ExistsAsync(Guid courseId);
    }
}
