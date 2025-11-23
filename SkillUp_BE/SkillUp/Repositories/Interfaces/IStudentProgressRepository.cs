using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IStudentProgressRepository
    {
        
        Task<StudentProgress?> GetByStudentAndQuizAsync(Guid studentId, Guid quizId);
        Task<StudentProgress?> GetByStudentAndLessonAsync(Guid studentId, Guid lessonId);
        Task<int> CountCompletedItemsAsync(Guid courseId, Guid studentId);
        Task AddAsync(StudentProgress progress);
        Task<bool> SaveChangesAsync();
    }
}
