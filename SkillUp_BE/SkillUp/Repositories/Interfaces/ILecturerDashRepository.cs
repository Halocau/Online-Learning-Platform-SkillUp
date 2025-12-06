using SkillUp.BussinessObjects.DTOs.Lecturer;
using SkillUp.BussinessObjects.DTOs.RevenueReport;
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

        Task<decimal> CalculateLifetimeRevenueAsync(Guid lecturerId, Guid? courseId);
        Task<List<RevenueChartDto>> GetRevenueChartAsync(Guid lecturerId, int? year, Guid? courseId);
        Task<List<CourseRevenueDto>> GetCourseRevenueBreakdownAsync(Guid lecturerId);
        Task<List<EnrolledStudentDto>> GetEnrolledStudentsAsync(Guid lecturerId, Guid? courseId);
    }
}
