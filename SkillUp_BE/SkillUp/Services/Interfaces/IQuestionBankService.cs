using SkillUp.BussinessObjects.DTOs.QuestionBank;
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
	public interface IQuestionBankService
	{
		Task<List<DetailQuestionBankDTO>> GetQuestionBanksBySectionIdAsync(Guid sectionId, Guid accountId, Guid courseId);
		Task<DetailQuestionBankDTO> GetQuestionBankByIdAsync(Guid id, Guid accountId, Guid courseId);
		Task<DetailQuestionBankDTO> CreateQuestionBankAsync(CreateQuestionBankDTO createQuestionBankDTO, Guid accountId, Guid courseId);
		Task<UpdateQuestionBankDTO> UpdateQuestionBank(UpdateQuestionBankDTO updateQuestionBankDTO, Guid questionBankId, Guid accountId, Guid courseId);
		Task DeleteQuestionBank(Guid id, Guid accountId, Guid courseId);
		Task<List<CreateQuestionBankDTO>> ReadQuestionsWithMultipleAnswersAsync(Stream excelStream, Guid sectionId, Guid accountId);

	}
}
