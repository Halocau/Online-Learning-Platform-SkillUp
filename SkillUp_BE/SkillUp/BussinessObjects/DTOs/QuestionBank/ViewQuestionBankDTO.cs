namespace SkillUp.BussinessObjects.DTOs.QuestionBank
{
	public class ViewQuestionBankDTO
	{
		public Guid Id { get; set; }

		public Guid SectionId { get; set; }

		public Guid LecturerId { get; set; }

		public string Title { get; set; } = null!;

		public string Description { get; set; } = null!;

		public DateTime CreatedAt { get; set; }

		public DateTime UpdatedAt { get; set; }

		public bool IsActive { get; set; }
	}
}
