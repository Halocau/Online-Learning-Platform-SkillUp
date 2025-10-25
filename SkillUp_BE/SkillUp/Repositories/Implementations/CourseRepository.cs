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

        public async Task<bool> SaveChangesAsync()
        {
           return await _context.SaveChangesAsync() > 0;
        }
    }
}
