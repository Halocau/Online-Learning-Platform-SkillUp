using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IQuestionQuizRepository
    {
        Task<QuestionQuiz?> GetLinkAsync(Guid quizId, Guid questionBankId);
        Task<List<QuestionQuiz?>> CheckQuestionUsed(Guid questionBankId);

		void Update(QuestionQuiz questionQuiz);
    }
}
