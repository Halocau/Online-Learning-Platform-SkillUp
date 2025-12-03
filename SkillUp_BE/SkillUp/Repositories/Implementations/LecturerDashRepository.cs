using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.DTOs.Lecturer;
using SkillUp.BussinessObjects.DTOs.RevenueReport;
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
        public async Task<decimal> CalculateLifetimeRevenueAsync(Guid lecturerId, Guid? courseId)
        {
            var query = _context.TransactionDetails
                .Include(td => td.Transaction)
                .Where(td => td.Transaction.Status == "Success");
            if (courseId.HasValue)
            {
                query = query.Where(td => td.CourseId == courseId.Value);
            }
            else
            {
                var lecturerCourseIds = _context.Courses
                    .Where(c => c.LecturerId == lecturerId)
                    .Select(c => c.Id);
                query = query.Where(td => lecturerCourseIds.Contains(td.CourseId));
            }

            return await query.SumAsync(td => td.Price);
        }

        public async Task<List<RevenueChartDto>> GetRevenueChartAsync(Guid lecturerId, int? year, Guid? courseId)
        {
            var query = _context.TransactionDetails
                .Include(td => td.Transaction)
                .Where(td => td.Transaction.Status == "Success");

            if (courseId.HasValue)
            {
                query = query.Where(td => td.CourseId == courseId.Value);
            }
            else
            {
                var lecturerCourseIds = _context.Courses
                    .Where(c => c.LecturerId == lecturerId)
                    .Select(c => c.Id);
                query = query.Where(td => lecturerCourseIds.Contains(td.CourseId));
            }
            int targetYear = year ?? DateTime.Now.Year;
            query = query.Where(td => td.Transaction.CreatedAt.Year == targetYear);
            return await query
                .GroupBy(td => td.Transaction.CreatedAt.Month)
                .Select(g => new RevenueChartDto
                {
                    OrderIndex = g.Key,
                    Label = $"T{g.Key}",
                    Revenue = g.Sum(td => td.Price)
                })
                .OrderBy(x => x.OrderIndex)
                .ToListAsync();
        }

        public async Task<List<CourseRevenueDto>> GetCourseRevenueBreakdownAsync(Guid lecturerId)
        {
            return await _context.Courses
                .Where(c => c.LecturerId == lecturerId && c.IsActive == true && c.Status == "Public")
                .Select(c => new CourseRevenueDto
                {
                    CourseId = c.Id,
                    Title = c.Title,
                    Image = c.Image,
                    TotalRevenue = _context.TransactionDetails
                        .Where(td => td.CourseId == c.Id && td.Transaction.Status == "Success")
                        .Sum(td => td.Price),
                    TotalSales = _context.TransactionDetails
                        .Count(td => td.CourseId == c.Id && td.Transaction.Status == "Success")
                })
                .OrderByDescending(c => c.TotalRevenue)
                .ToListAsync();
        }
        public async Task<List<EnrolledStudentDto>> GetEnrolledStudentsAsync(Guid lecturerId, Guid? courseId)
        {
            var query = _context.Enrollments
                .Include(e => e.Course)
                .Include(e => e.Student).ThenInclude(s => s.Account)
                .Where(e => e.Course.LecturerId == lecturerId);

            if (courseId.HasValue)
            {
                query = query.Where(e => e.CourseId == courseId.Value);
            }

            var result = await query
                .Select(e => new EnrolledStudentDto
                {
                    StudentId = e.StudentId,
                    StudentName = e.Student.Account.Fullname ?? "Unknown",
                    Email = e.Student.Account.Email,
                    Avatar = e.Student.Account.Avatar,
                    CourseId = e.CourseId,
                    CourseTitle = e.Course.Title,
                    EnrolledAt = e.EnrolledAt,
                    TotalLessons = _context.Lessons
                        .Count(l => l.Section.CourseId == e.CourseId && l.IsActive == true),
                    CompletedLessons = _context.StudentProgresses
                        .Count(sp => sp.StudentId == e.StudentId
                                     && sp.CourseId == e.CourseId
                                     && sp.IsCompleted == true)
                })
                .OrderByDescending(e => e.EnrolledAt)
                .ToListAsync();

            return result;
        }
    }
}
