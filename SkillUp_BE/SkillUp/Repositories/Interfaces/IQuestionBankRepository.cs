using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IQuestionBankRepository
    {
        Task CreateAsync(QuestionBank question);
        Task AddRangeAsync(List<QuestionBank> questions);
        void Update(QuestionBank question);
        Task<QuestionBank?> GetByIdAsync(Guid id);
        Task<List<QuestionBank>> GetBySectionId(Guid sectionId);
		Task<List<QuestionBank>> GetByCourseId(Guid courseId);
		Task<bool> SaveChangesAsync();
        Task<QuestionBank?> GetQuestionWithAnswersAsync(Guid questionId);
        Task<List<QuestionBank>> GetQuestionsWithAnswersAsync(List<Guid> questionIds);
    }
}
