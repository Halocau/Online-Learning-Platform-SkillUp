using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class StudentProgressRepository : IStudentProgressRepository
    {
        private readonly SkillUpContext _context;

        public StudentProgressRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<StudentProgress?> GetByStudentAndQuizAsync(Guid studentId, Guid quizId)
        {
            return await _context.StudentProgresses
                .FirstOrDefaultAsync(sp => sp.StudentId == studentId && sp.QuizId == quizId);
        }
        public async Task<StudentProgress?> GetByStudentAndLessonAsync(Guid studentId, Guid lessonId)
        {
            return await _context.StudentProgresses
                .FirstOrDefaultAsync(sp => sp.StudentId == studentId && sp.LessonId == lessonId);
        }
        public async Task AddAsync(StudentProgress progress)
        {
            await _context.StudentProgresses.AddAsync(progress);
        }
        public async Task<int> CountCompletedItemsAsync(Guid courseId, Guid studentId)
        {
            return await _context.StudentProgresses
        .Where(sp => sp.CourseId == courseId && sp.StudentId == studentId)
        .Where(sp => sp.IsCompleted == true)
        .CountAsync();
        }
        public async Task<StudentProgress?> GetLastViewedItemAsync(Guid courseId, Guid studentId)
        {
            return await _context.StudentProgresses
                .Where(sp => sp.CourseId == courseId && sp.StudentId == studentId)
                .OrderByDescending(sp => sp.LastViewedAt)
                .FirstOrDefaultAsync();
        }
        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
