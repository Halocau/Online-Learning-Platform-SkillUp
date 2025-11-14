using SkillUp.BussinessObjects.DTOs.Question;

namespace SkillUp.BussinessObjects.DTOs.QuestionBank
{
	public class CreateQuestionBankResponseDTO
	{
		public Guid SectionId { get; set; }

		public Guid LecturerId { get; set; }

		public string Title { get; set; } = null!;

		public string Description { get; set; } = null!;

		public string? Type { get; set; }

		public List<CreateAnswerDTO> Answers { get; set; } = new();
	}
}
