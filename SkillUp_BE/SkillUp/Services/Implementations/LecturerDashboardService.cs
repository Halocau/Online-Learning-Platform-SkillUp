using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.DTOs.LecturerDashboard;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class LecturerDashboardService : ILecturerDashboardService
    {
        private readonly ILecturerDashRepository _lecturerDashRepository;
        private readonly SkillUpContext _context;

        private const decimal LECTURER_REVENUE_SHARE = 0.6m;

        public LecturerDashboardService(ILecturerDashRepository lecturerDashRepository, SkillUpContext context)
        {
            _lecturerDashRepository = lecturerDashRepository;
            _context = context;
        }

        public async Task<LecturerDashboardDto> GetLecturerDashboardAsync(Guid accountId)
        {
            var lecturer = await _context.Lecturers
                .FirstOrDefaultAsync(l => l.AccountId == accountId);

            if (lecturer == null)
            {
                throw new Exception("Tài khoản này chưa được đăng ký thông tin Giảng viên.");
            }

            var startOfMonth = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);

            var totalCourses = await _lecturerDashRepository.CountActiveCoursesAsync(lecturer.Id);

            var totalStudents = await _lecturerDashRepository.CountTotalStudentsAsync(lecturer.Id);

            var grossRevenue = await _lecturerDashRepository.CalculateTotalRevenueAsync(lecturer.Id, startOfMonth);

            var recentCoursesEntities = await _lecturerDashRepository.GetRecentActiveCoursesAsync(lecturer.Id, 10);

            var courseDtos = recentCoursesEntities.Select(course => new CourseDashboardSummaryDto
            {
                Id = course.Id,
                Title = course.Title,
                Image = course.Image,
                TotalStudents = course.Enrollments.Count,
                TotalLessons = course.Sections
                    .SelectMany(s => s.Lessons)
                    .Count(l => l.IsActive)
            }).ToList();

            var netRevenue = grossRevenue * LECTURER_REVENUE_SHARE;

            return new LecturerDashboardDto
            {
                TotalCourses = totalCourses,
                TotalStudents = totalStudents,
                CurrentMonthEarnings = netRevenue,
                Courses = courseDtos
            };
        }
    }
}
