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

        public async Task AddRangeAsync(List<QuestionBank> questions)
        {
            await _context.AddRangeAsync(questions);
        }

		public async Task<QuestionBank?> GetByIdAsync(Guid id)
		{
			return await _context.QuestionBanks
                .Include(q => q.AnswerBanks)
				.FirstOrDefaultAsync(q => q.Id == id);
		}

		public async Task<List<QuestionBank>> GetBySectionId(Guid sectionId)
		{
			return await _context.QuestionBanks
                .Include(q => q.AnswerBanks.Where(a => a.IsActive))
				.Where(q => q.SectionId == sectionId)
				.Where(q => q.IsActive && q.IsHidden == false)
				.ToListAsync();
		}

		public async Task<List<QuestionBank>> GetByCourseId(Guid courseId)
		{
			return await _context.QuestionBanks
				.Include(q => q.AnswerBanks.Where(a => a.IsActive))
				.Where(q => q.Section.CourseId == courseId)
				.Where(q => q.IsActive && q.IsHidden == false)
				.ToListAsync();
		}

		public void Update(QuestionBank question)
		{
			_context.QuestionBanks.Update(question);
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
    }
}
