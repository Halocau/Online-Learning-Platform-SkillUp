using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class QuestionQuizRepository : IQuestionQuizRepository
    {
        private readonly SkillUpContext _context; 

        public QuestionQuizRepository(SkillUpContext context)
        {
            _context = context;
        }
        public async Task<QuestionQuiz?> GetLinkAsync(Guid quizId, Guid questionBankId)
        {
            return await _context.QuestionQuizzes
                .FirstOrDefaultAsync(qq =>
                    qq.QuizId == quizId &&
                    qq.QuestionBankId == questionBankId);
        }

		public async Task<QuestionQuiz?> CheckQuestionUsed(Guid questionBankId)
		{
			return await _context.QuestionQuizzes
				.FirstOrDefaultAsync(qq =>
					qq.QuestionBankId == questionBankId);
		}

		public void Update(QuestionQuiz questionQuiz)
        {
            _context.QuestionQuizzes.Update(questionQuiz);
        }
    }
}
