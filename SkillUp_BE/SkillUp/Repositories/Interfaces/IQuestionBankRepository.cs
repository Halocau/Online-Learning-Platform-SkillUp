using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IQuestionBankRepository
    {
        Task CreateAsync(QuestionBank question);
        void Update(QuestionBank question);
        Task<bool> SaveChangesAsync();
        Task<QuestionBank?> GetQuestionWithAnswersAsync(Guid questionId);
    }
}
