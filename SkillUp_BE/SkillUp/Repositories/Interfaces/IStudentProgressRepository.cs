using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IStudentProgressRepository
    {
        
        Task<StudentProgress?> GetByStudentAndQuizAsync(Guid studentId, Guid quizId);

        Task AddAsync(StudentProgress progress);
    }
}
