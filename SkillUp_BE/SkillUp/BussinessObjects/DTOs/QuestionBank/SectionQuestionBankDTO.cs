namespace SkillUp.BussinessObjects.DTOs.QuestionBank
{
	public class SectionQuestionBankDTO
	{
		public Guid Id { get; set; }

		public Guid CourseId { get; set; }

		public string? Title { get; set; }

		public string? Description { get; set; }

		public DateTime CreatedAt { get; set; }

		public DateTime UpdatedAt { get; set; }

		public bool IsActive { get; set; }

		public double? Orders { get; set; }

		public List<DetailQuestionBankDTO> QuestionBanks { get; set; } = new List<DetailQuestionBankDTO>();
	}
}
