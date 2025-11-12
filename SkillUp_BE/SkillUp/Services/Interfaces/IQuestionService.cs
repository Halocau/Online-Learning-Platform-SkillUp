using SkillUp.BussinessObjects.DTOs.Question;

namespace SkillUp.Services.Interfaces
{
    public interface IQuestionService
    {
        Task<bool> AddQuestionWithAnswersToQuizAsync(CreateQuestionDTO createQuestionDTO , Guid accId);

        Task<bool> UpdateQuestionWithAnswersAsync(Guid questionId, UpdateQuestionDTO dto, Guid accId);

        Task<bool> AddBulkQuestionFromBankToQuizAsync(List<CreateQuestionQuizDTO> createQuestionQuizDTOs, Guid accId);

	}
}
