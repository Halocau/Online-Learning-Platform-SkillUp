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

		public async Task<QuestionBank?> GetByIdAsync(Guid id)
		{
			return await _context.QuestionBanks.FindAsync(id);
		}

		public async Task<List<QuestionBank>> GetBySectionId(Guid sectionId)
		{
			return await _context.QuestionBanks
				.Where(q => q.SectionId == sectionId)
				.Where(q => q.IsActive)
				.ToListAsync();
		}

		public async Task SaveChangesAsync()
		{
			await _context.SaveChangesAsync();
		}

		public void Update(QuestionBank question)
		{
			_context.QuestionBanks.Update(question);
		}
	}
}
