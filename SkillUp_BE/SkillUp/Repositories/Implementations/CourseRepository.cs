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
        public async Task<List<Course>> GetAllCourseAsync()
        {
            return await _context.Courses
                                 .Include(c => c.Lecturer).ThenInclude(l => l.Account)
                                 .Include(c => c.SubCategory)
                                 .ToListAsync();
        }


        public async Task<Course?> GetCourseByIdAsync(Guid courseId)
        {
            return await _context.Courses.FirstOrDefaultAsync(c => c.Id == courseId);
        }

        public async Task<List<Course>> GetCoursesBySubCategoryId(int id)
        {
            return await _context.Courses.Where(c => c.IsActive == true && c.Status == "Public" && c.SubCategoryId == id)
                .Include(c => c.Lecturer)
                .ThenInclude(l => l.Account)
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }
        public async Task<List<Course>> GetCoursesOfLecturer(Guid lecturerId)
        {
            return await _context.Courses
                                 .Where(c => c.LecturerId == lecturerId)
                                    .Include(c => c.Lecturer)
                                    .Include(c => c.SubCategory)
                                    .ToListAsync();
        }

        public async Task<List<Course>> GetNewestCoursesAsync(int limit)
        {
            return await _context.Courses
                .Where(c => c.IsActive == true && c.Status == "Public")
                .Include(c => c.Lecturer)
                    .ThenInclude(l => l.Account)
                .OrderByDescending(c => c.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<List<Course>> GetPopularCoursesAsync(int limit)
        {
            return await _context.Courses
                .Where(c => c.IsActive == true && c.Status == "Public")
                .Include(c => c.Lecturer)
                    .ThenInclude(l => l.Account)
                .OrderByDescending(c => c.EnrollmentCount)
                .ThenByDescending(c => c.Rating)
                .Take(limit)
                .ToListAsync();
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
