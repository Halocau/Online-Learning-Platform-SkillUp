using SkillUp.BussinessObjects.DTOs.Question;

namespace SkillUp.BussinessObjects.DTOs.QuestionBank
{
	public class UpdateQuestionBankDTO
	{
		public Guid SectionId { get; set; }

		public string Title { get; set; } = null!;

		public List<UpdateAnswerDTO> Answers { get; set; } = new List<UpdateAnswerDTO>();
	}
}
