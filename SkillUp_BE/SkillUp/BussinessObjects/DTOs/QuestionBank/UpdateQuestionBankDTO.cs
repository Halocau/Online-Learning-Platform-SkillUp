namespace SkillUp.BussinessObjects.DTOs.QuestionBank
{
	public class UpdateQuestionBankDTO
	{
		public Guid SectionId { get; set; }

		public string Title { get; set; } = null!;

		public string Description { get; set; } = null!;

		public DateTime UpdatedAt { get; set; }
	}
}
