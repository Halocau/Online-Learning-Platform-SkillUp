using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IStudentSelectedAnswersRepository
    {
        Task AddRangeAsync(IEnumerable<StudentSelectedAnswer> answers);
        Task<List<StudentSelectedAnswer>> GetSelectedAnswersBySubmissionIdAsync(Guid submissionId);
    }
}
