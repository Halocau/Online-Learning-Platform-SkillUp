using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class QuestionBankRepository : IQuestionBankRepository
    {
        private readonly SkillUpContext _context;

        public QuestionBankRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task CreateAsync(QuestionBank question)
        {
            await _context.AddAsync(question);
        }

        public async Task<QuestionBank?> GetQuestionWithAnswersAsync(Guid questionId)
        {
            return await _context.QuestionBanks
                .Include(q => q.AnswerBanks)
                .FirstOrDefaultAsync(q => q.Id == questionId && q.IsActive);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public void Update(QuestionBank question)
        {
            _context.QuestionBanks.Update(question);
        }
    }
}
