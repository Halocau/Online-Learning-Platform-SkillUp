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

        public async Task AddAsync(StudentProgress progress)
        {
            await _context.StudentProgresses.AddAsync(progress);
        }
    }
}
