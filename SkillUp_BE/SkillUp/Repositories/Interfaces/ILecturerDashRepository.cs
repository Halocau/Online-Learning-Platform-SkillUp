using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ILecturerDashRepository
    {
        Task<int> CountActiveCoursesAsync(Guid lecturerId);
        Task<int> CountTotalStudentsAsync(Guid lecturerId);
        Task<decimal> CalculateTotalRevenueAsync(Guid lecturerId, DateTime fromDate);

        Task<List<Course>> GetRecentActiveCoursesAsync(Guid lecturerId, int take);
        Task<decimal> CalculateCourseRevenueAsync(Guid courseId);
    }
}
