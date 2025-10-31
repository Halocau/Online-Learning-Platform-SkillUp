using SkillUp.BussinessObjects.DTOs.Question;

namespace SkillUp.Services.Interfaces
{
    public interface IQuestionService
    {
        Task<bool> AddQuestionWithAnswersToQuizAsync(CreateQuestionDTO createQuestionDTO , Guid accId);
    }
}
