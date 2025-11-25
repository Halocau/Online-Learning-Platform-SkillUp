using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.DTOs.Course;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class CourseRepository : ICourseRepository
    {
        private readonly SkillUp1Context _context;

        public CourseRepository(SkillUp1Context context)
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
                .Where(c => c.Status != "Draft")
                                 .Include(c => c.Lecturer)
                                 .ThenInclude(l => l.Account)
                                 .Include(c => c.SubCategory)
                                 .ToListAsync();
        }


        public async Task<Course?> GetCourseByIdAsync(Guid courseId)
        {
            return await _context.Courses.Include(c => c.Lecturer).FirstOrDefaultAsync(c => c.Id == courseId);
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
                    .ThenInclude(s => s.Lessons)
                        .ThenInclude(l => l.Assets)
                .Include(c => c.Sections)
                    .ThenInclude(s => s.Quizzes)
                        .ThenInclude(q => q.QuizSubmissions)
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
        public async Task<bool> ExistsAsync(Guid courseId)
        {
            return await _context.Courses.AnyAsync(c => c.Id == courseId);
        }

        public async Task<List<Course>> GetCoursesByCategoryId(int id)
        {
            return await _context.Courses
                  .Where(c => c.IsActive == true
                         && c.Status == "Public"
                         && c.SubCategory.CategoryId == id)
                  .Include(c => c.Lecturer)
              .ThenInclude(l => l.Account)
              .OrderByDescending(c => c.CreatedAt)
              .ToListAsync();
        }

        //rating
        public async Task<Course?> GetByIdAsync(Guid id)
        {
            return await _context.Courses.FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task UpdateAsync(Course course)
        {
            _context.Courses.Update(course);
            await _context.SaveChangesAsync();
        }

        public async Task<List<CourseStudentEnrollDTO>> GetEnrolledCoursesByAccountIdAsync(Guid accountId)
        {
            var enrolledCourses = await _context.Enrollments
                .Where(e => e.Student.AccountId == accountId && e.Course.Status != "Draft")
                .Include(e => e.Course)
                    .ThenInclude(c => c.Lecturer)
                    .ThenInclude(l => l.Account)
                .Include(e => e.Course)
                    .ThenInclude(c => c.SubCategory)
                .Select(e => new CourseStudentEnrollDTO
                {
                    Id = e.Course.Id,
                    Title = e.Course.Title,
                    Description = e.Course.Description,
                    Price = e.Course.Price,
                    Image = e.Course.Image,
                    Rating = e.Course.Rating,
                    EnrollmentCount = e.Course.EnrollmentCount,
                    CreatedAt = e.Course.CreatedAt,
                    UpdatedAt = e.Course.UpdatedAt,
                    LecturerName = e.Course.Lecturer.Account.Fullname,
                    SubCategoryName = e.Course.SubCategory.Name,
                    SubCategoryId = e.Course.SubCategoryId,
                    EnrolledAt = e.EnrolledAt
                })
                .OrderByDescending(c => c.EnrolledAt)
                .ToListAsync();

            return enrolledCourses;
        }

        public async Task<List<CourseSummaryDTO>> SearchCoursesAsync(string keyword, int limit)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return new List<CourseSummaryDTO>();
            }

            var trimmedKeyword = keyword.Trim();
            var pattern = $"%{trimmedKeyword}%";
            var safeLimit = Math.Clamp(limit, 1, 50);
            const string accentInsensitiveCollation = "SQL_Latin1_General_CP1_CI_AI";

            var query = _context.Courses
                .AsNoTracking()
                .Where(c => c.IsActive && c.Status == "Public")
                .Where(c =>
                    EF.Functions.Like(EF.Functions.Collate(c.Title, accentInsensitiveCollation), pattern) ||
                    (c.Description != null && EF.Functions.Like(EF.Functions.Collate(c.Description, accentInsensitiveCollation), pattern)) ||
                    (c.Lecturer != null && c.Lecturer.Account != null && EF.Functions.Like(EF.Functions.Collate(c.Lecturer.Account.Fullname, accentInsensitiveCollation), pattern)) ||
                    (c.SubCategory != null && EF.Functions.Like(EF.Functions.Collate(c.SubCategory.Name, accentInsensitiveCollation), pattern)))
                .OrderByDescending(c => c.EnrollmentCount)
                .ThenByDescending(c => c.Rating ?? 0)
                .Select(c => new CourseSummaryDTO
                {
                    Id = c.Id,
                    Title = c.Title,
                    Image = c.Image,
                    Price = c.Price,
                    Rating = c.Rating,
                    EnrollmentCount = c.EnrollmentCount,
                    LecturerName = c.Lecturer != null && c.Lecturer.Account != null
                        ? c.Lecturer.Account.Fullname
                        : string.Empty,
                    SubCategoryId = c.SubCategoryId
                })
                .Take(safeLimit);

            return await query.ToListAsync();
        }
    }
}
