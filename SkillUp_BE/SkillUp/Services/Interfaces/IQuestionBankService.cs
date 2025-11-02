using SkillUp.BussinessObjects.DTOs.QuestionBank;
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
	public interface IQuestionBankService
	{
		Task<List<ViewQuestionBankDTO>> GetQuestionBanksBySectionIdAsync(Guid sectionId, Guid accountId, Guid courseId);
		Task<ViewQuestionBankDTO> GetQuestionBankByIdAsync(Guid id, Guid accountId, Guid courseId);
		Task<CreateQuestionBankDTO> CreateQuestionBankAsync(CreateQuestionBankDTO createQuestionBankDTO, Guid accountId, Guid courseId);
		Task<UpdateQuestionBankDTO> UpdateQuestionBank(UpdateQuestionBankDTO updateQuestionBankDTO, Guid questionBankId, Guid accountId, Guid courseId);
		Task DeleteQuestionBank(Guid id, Guid accountId, Guid courseId);

	}
}
