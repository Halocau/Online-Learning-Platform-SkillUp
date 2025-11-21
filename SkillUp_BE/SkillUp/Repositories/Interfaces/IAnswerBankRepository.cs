using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IAnswerBankRepository
    {
        Task<List<AnswerBank>> GetActiveAnswersForQuestionAsync(Guid questionBankId);
    }
}
