using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IReportCourseRepository
    {
        Task AddAsync(ReportCourse report);
        Task<ReportCourse?> GetByIdAsync(Guid id);
        Task<List<ReportCourse>> GetAllAsync();

        // Hàm này quan trọng: Chỉ save, không gọi Update()
        Task UpdateAsync(ReportCourse report);

        Task<bool> HasReportedAsync(Guid studentId, Guid courseId);
        Task<Student?> GetStudentByAccountIdAsync(Guid accountId);
    }
}