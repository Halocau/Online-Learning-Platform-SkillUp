using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IQuizAnswerSubmissionRepository
    {
      
        Task AddRangeAsync(IEnumerable<QuizAnswerSubmission> submissions);

        Task<List<QuizAnswerSubmission>> GetBySubmissionIdAsync(Guid submissionId);
    }
}
