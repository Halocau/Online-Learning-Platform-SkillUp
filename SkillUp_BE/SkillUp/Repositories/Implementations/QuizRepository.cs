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

        public async Task<bool> SaveChangesAsync()
        {
         
            return await _context.SaveChangesAsync() > 0;
        
    }
    }
}
