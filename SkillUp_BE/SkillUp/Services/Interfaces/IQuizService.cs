using SkillUp.BussinessObjects.DTOs.DoQuiz;
using SkillUp.BussinessObjects.DTOs.Quiz;
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
    public interface IQuizService
    {
        Task<Guid> CreateQuizAsync(CreateQuizDTO dto, Guid accId);

        Task<bool> UpdateQuizAsync(Guid quizId, UpdateQuizDTO dto, Guid accountId);

        Task<bool> DeleteQuizAsync(Guid quizId, Guid accountId);
        Task<QuizDetailDTO?> GetQuizDetailAsync(Guid quizId, Guid accountId);
        Task<QuizStartDto> StartQuizAsync(Guid quizId, Guid accId);

        Task<QuizResultSummaryDto> SubmitQuizAsync(Guid submissionId, QuizSubmitDto submitDto, Guid accId);
        Task<QuizResultDetailDto> GetQuizResultDetailAsync(Guid submissionId, Guid accountId);
    }
}
