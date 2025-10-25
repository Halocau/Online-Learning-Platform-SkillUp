using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class CourseRepository : ICourseRepository
    {
        private readonly SkillUpContext _context;

        public CourseRepository(SkillUpContext context)
        {
            _context = context;
        }
        public async Task AddCourseAsync(Course course)
        {
            await _context.AddAsync(course);
        }

        public async Task<Course?> GetCourseByIdAsync(Guid courseId)
        {
            return await _context.Courses.FirstOrDefaultAsync(c  => c.Id == courseId);
        }

        public async Task<bool> SaveChangesAsync()
        {
           return await _context.SaveChangesAsync() > 0;
        }

        public void UpdateCourse(Course course)
        {
            _context.Update(course);
        }

    }
}
