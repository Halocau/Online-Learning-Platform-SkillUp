using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IQuizRepository
    {
        Task<Quiz> CreateQuizAsync (Quiz quiz);
        Task<bool> SaveChangesAsync();
        Task<Quiz?> GetQuizByIdAsync(Guid id);
        void UpdateQuiz(Quiz quiz);
        Task<Quiz?> GetQuizWithSectionAndCourseAsync(Guid quizId);

        Task<Quiz?> GetQuizWithQuestionsAsync(Guid quizId);

    }
}
