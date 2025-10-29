using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ICourseRepository
    {
        Task AddCourseAsync(Course course);
        Task<Course?> GetCourseByIdAsync(Guid courseId);
        Task<bool> SaveChangesAsync();
        void UpdateCourse(Course course);

        Task<List<Course>> GetPopularCoursesAsync(int limit);
        Task<List<Course>> GetNewestCoursesAsync(int limit);

        Task<List<Course>> GetCoursesBySubCategoryId(int id);
    }
}
