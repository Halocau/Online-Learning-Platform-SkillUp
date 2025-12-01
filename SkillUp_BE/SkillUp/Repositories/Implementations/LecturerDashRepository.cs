using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class LecturerDashRepository : ILecturerDashRepository
    {
        private readonly SkillUpContext _context;

        public LecturerDashRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<int> CountActiveCoursesAsync(Guid lecturerId)
        {
            return await _context.Courses
                .CountAsync(c => c.LecturerId == lecturerId
                                 && c.IsActive == true
                                 && c.Status == "Public");
        }

        public async Task<int> CountTotalStudentsAsync(Guid lecturerId)
        {
            var courseIds = _context.Courses
                .Where(c => c.LecturerId == lecturerId && c.IsActive == true)
                .Select(c => c.Id);

            return await _context.Enrollments
                .Where(e => courseIds.Contains(e.CourseId))
                .Select(e => e.StudentId)
                .Distinct()
                .CountAsync();
        }

        public async Task<decimal> CalculateTotalRevenueAsync(Guid lecturerId, DateTime fromDate)
        {
            var courseIds = _context.Courses
                .Where(c => c.LecturerId == lecturerId && c.IsActive == true)
                .Select(c => c.Id);

            return await _context.TransactionDetails
                .Include(td => td.Transaction)
                .Where(td => courseIds.Contains(td.CourseId)
                             && (td.Transaction.Status == "Success")
                             && td.Transaction.CreatedAt >= fromDate)
                .SumAsync(td => td.Price);
        }

        public async Task<List<Course>> GetRecentActiveCoursesAsync(Guid lecturerId, int take)
        {
            return await _context.Courses
                .Where(c => c.LecturerId == lecturerId
                            && c.IsActive == true
                            && c.Status == "Public")
                .OrderByDescending(c => c.CreatedAt)
                .Take(take)
                .Include(c => c.Enrollments)
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Lessons)
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<decimal> CalculateCourseRevenueAsync(Guid courseId)
        {
            return await _context.TransactionDetails
                .Include(td => td.Transaction)
                .Where(td => td.CourseId == courseId
                             && (td.Transaction.Status == "Success"))
                .SumAsync(td => td.Price);
        }
    }
}
