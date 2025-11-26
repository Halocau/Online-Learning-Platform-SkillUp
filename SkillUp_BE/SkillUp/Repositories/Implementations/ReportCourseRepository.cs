using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class ReportCourseRepository : IReportCourseRepository
    {
        private readonly SkillUpContext _context;

        public ReportCourseRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task AddAsync(ReportCourse report)
        {
            await _context.ReportCourses.AddAsync(report);
            await _context.SaveChangesAsync();
        }

        public async Task<ReportCourse?> GetByIdAsync(Guid id)
        {
            // INCLUDE là bắt buộc để lấy được Course và cập nhật IsActive
            return await _context.ReportCourses
                .Include(r => r.Course)
                .Include(r => r.Student)
                .ThenInclude(s => s.Account)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<ReportCourse>> GetAllAsync()
        {
            return await _context.ReportCourses
                .Include(r => r.Course)
                .Include(r => r.Student)
                .ThenInclude(s => s.Account)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task UpdateAsync(ReportCourse report)
        {
            

            await _context.SaveChangesAsync();
        }

        public async Task<bool> HasReportedAsync(Guid studentId, Guid courseId)
        {
            // Chỉ trả về true (đã report) nếu đang có đơn trạng thái là 'Pending'
            // Nghĩa là: Nếu đơn cũ đã Accepted/Rejected thì được phép tạo đơn mới.
            return await _context.ReportCourses
                .AnyAsync(x => x.StudentId == studentId
                            && x.CourseId == courseId
                            && x.Status == "Pending");
        }

        public async Task<Student?> GetStudentByAccountIdAsync(Guid accountId)
        {
            return await _context.Students.FirstOrDefaultAsync(x => x.AccountId == accountId);
        }
    }
}