using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class EnrollmentRepository : IEnrollmentRepository
    {
        private readonly SkillUp1Context _context;

        public EnrollmentRepository(SkillUp1Context context)
        {
            _context = context;
        }
        public async Task<List<Enrollment>> GetEnrolledCoursesWithDetailsAsync(Guid studentId)
        {
            return await _context.Enrollments
                .Where(e => e.StudentId == studentId)
                .Include(e => e.Course)
                    .ThenInclude(c => c.Lecturer)
                        .ThenInclude(l => l.Account)
                .Include(e => e.Course)
                    .ThenInclude(c => c.Sections)
                        .ThenInclude(s => s.Lessons)
                .Include(e => e.Course)
                    .ThenInclude(c => c.Sections)
                        .ThenInclude(s => s.Quizzes)
                .OrderByDescending(e => e.EnrolledAt) 
                .ToListAsync();
        }
        public async Task<bool> IsStudentEnrolledInCourseAsync(Guid studentId, Guid courseId)
        {
            return await _context.Enrollments
                .AnyAsync(e => e.StudentId == studentId && e.CourseId == courseId);
        }
    }
}
