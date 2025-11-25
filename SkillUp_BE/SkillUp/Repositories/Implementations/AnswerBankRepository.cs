using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class AnswerBankRepository : IAnswerBankRepository
    {
        private readonly SkillUp1Context _context;

        public AnswerBankRepository(SkillUp1Context context)
        {
            _context = context;
        }
        public async Task<List<AnswerBank>> GetActiveAnswersForQuestionAsync(Guid questionBankId)
        {
            return await _context.AnswerBanks
                .Where(a => a.QuestionBankId == questionBankId && a.IsActive)
                .ToListAsync();
        }
    }
}
