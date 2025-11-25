using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class QuizRepository : IQuizRepository
    {
        private readonly SkillUp1Context _context;

        public QuizRepository(SkillUp1Context context)
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

        public async Task<Quiz?> GetQuizWithQuestionsAsync(Guid quizId)
        {
            return await _context.Quizzes
                .Include(q => q.Section)
                    .ThenInclude(s => s.Course)
                .Include(q => q.QuestionQuizzes)
                    .ThenInclude(qq => qq.QuestionBank)
                        .ThenInclude(qb => qb.AnswerBanks)
                .FirstOrDefaultAsync(q => q.Id == quizId && q.IsActive);
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

		public async Task<List<Quiz>> GetQuizzesByIdsAndSectionAsync(IEnumerable<Guid> ids, Guid sectionId)
		{
			return await _context.Quizzes
				.Where(q => q.SectionId == sectionId && ids.Contains(q.Id))
				.ToListAsync();
		}
	}
}
