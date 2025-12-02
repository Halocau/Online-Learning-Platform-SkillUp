using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IQuizSubmissionRepository
    {
        Task AddAsync(QuizSubmission submission);

        Task<QuizSubmission?> GetByIdAsync(Guid id);

        void Update(QuizSubmission submission);

        Task<List<QuizSubmission>> GetSubmissionsByQuizAndStudentAsync(Guid quizId, Guid studentId);

        Task<QuizSubmission?> GetSubmissionWithDetailsAsync(Guid id, Guid studentId);

        Task<bool> SaveChangesAsync();

        Task<List<QuizSubmission>> GetQuestionBanksInSubmission(Guid questionBankId);

	}
}
