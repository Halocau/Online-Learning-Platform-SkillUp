using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IQuestionBankRepository
    {
        Task CreateAsync(QuestionBank question);
        Task SaveChangesAsync();
        void Update(QuestionBank question);
        Task<QuestionBank?> GetByIdAsync(Guid id);
        Task<List<QuestionBank>> GetBySectionId(Guid sectionId);

        void Update(QuestionBank question);
        Task<bool> SaveChangesAsync();
        Task<QuestionBank?> GetQuestionWithAnswersAsync(Guid questionId);
    }
}
