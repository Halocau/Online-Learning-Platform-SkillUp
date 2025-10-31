using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class QuizRepository : IQuizRepository
    {
        private readonly SkillUpContext _context;

        public QuizRepository(SkillUpContext context)
        {
            _context = context;
        }
        public async Task<Quiz> CreateQuizAsync(Quiz quiz)
        {
            await _context.AddAsync(quiz);
            return quiz;
        }

        public async Task<Quiz?> GetQuizByIdAsync(Guid id)
        {
            return await _context.Quizzes.FirstOrDefaultAsync(q => q.Id == id);
        }

        public async Task<Quiz?> GetQuizWithSectionAndCourseAsync(Guid quizId)
        {
            return await _context.Quizzes.Include(q => q.Section)
                 .ThenInclude(s => s.Course)
                 .FirstOrDefaultAsync(q => q.Id == quizId);
        }

        public async Task<bool> SaveChangesAsync()
        {
         
            return await _context.SaveChangesAsync() > 0;
        
    }

        public void UpdateQuiz(Quiz quiz)
        {
            _context.Quizzes.Update(quiz);
        }
      
    }
}
