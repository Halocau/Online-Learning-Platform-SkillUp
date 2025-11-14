using SkillUp.BussinessObjects.DTOs.Question;

namespace SkillUp.Services.Interfaces
{
    public interface IQuestionService
    {
        Task<QuestionResponseDto> AddQuestionWithAnswersToQuizAsync(CreateQuestionDTO createQuestionDTO , Guid accId);

        Task<bool> UpdateQuestionWithAnswersAsync(Guid questionId, UpdateQuestionDTO dto, Guid accId);

        Task<List<CreateQuestionQuizResponseDTO>> AddBulkQuestionFromBankToQuizAsync(List<CreateQuestionQuizDTO> createQuestionQuizDTOs, Guid accId);

	}
}
