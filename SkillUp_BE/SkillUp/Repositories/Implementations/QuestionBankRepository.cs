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
    }
}
