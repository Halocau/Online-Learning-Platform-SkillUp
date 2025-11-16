using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IQuizSubmissionRepository
    {
        Task AddAsync(QuizSubmission submission);
        Task<bool> SaveChangesAsync();
    }
}
