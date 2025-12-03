using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IEnrollmentRepository
    {
        Task<List<Enrollment>> GetEnrolledCoursesWithDetailsAsync(Guid studentId);
        Task<bool> IsStudentEnrolledInCourseAsync(Guid studentId, Guid courseId);
        Task<List<Guid>> GetStudentAccountIdsByCourseIdAsync(Guid courseId);
    }
}
