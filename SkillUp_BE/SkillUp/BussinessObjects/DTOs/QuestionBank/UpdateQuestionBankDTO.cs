using SkillUp.BussinessObjects.DTOs.Question;

namespace SkillUp.BussinessObjects.DTOs.QuestionBank
{
	public class UpdateQuestionBankDTO
	{
		public Guid SectionId { get; set; }

		public string Title { get; set; } = null!;

		public string? Image { get; set; }

		public List<UpdateAnswerBankDTO> Answers { get; set; } = new List<UpdateAnswerBankDTO>();
	}
}
