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
                         //.Where(c => c.LecturerId == lecturerId &&
                         //    (c.Status == "Public" || c.Status == "Draft"))
                         .Include(c => c.Lecturer)
                         .Include(c => c.SubCategory)
                             .ThenInclude(sc => sc.Category)
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

        public async Task<List<Section>> GetSectionsByCourseIdAsync(Guid courseId)
        {
            return await _context.Sections
            .Where(s => s.CourseId == courseId)
            .Include(s => s.Lessons)
            .ThenInclude(l => l.Assets)
            .ToListAsync();
        }

        public async Task<Course?> GetCourseWithDetailsAsync(Guid courseId)
        {
            return await _context.Courses
                .Include(c => c.Lecturer)
                    .ThenInclude(l => l.Account)
                .Include(c => c.SubCategory)
                    .ThenInclude(sc => sc.Category)
                .Include(c => c.Sections.OrderBy(s => s.CreatedAt))
                    .ThenInclude(s => s.Lessons.OrderBy(l => l.CreatedAt))
                        .ThenInclude(l => l.Assets)
                .FirstOrDefaultAsync(c => c.Id == courseId);
        }
        public async Task<List<Course>> GetCoursesOfLecturerByAccountIdAsync(Guid accountId)
        {
            return await _context.Courses
                .Where(c => c.Lecturer != null && c.Lecturer.AccountId == accountId)
                .Include(c => c.SubCategory)
                    .ThenInclude(sc => sc.Category)
                .Where(c => c.IsActive) 
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
