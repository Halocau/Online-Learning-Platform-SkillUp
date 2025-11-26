namespace SkillUp.BussinessObjects.DTOs.QuestionBank
{
	public class UpdateAnswerBankDTO
	{
		public Guid? AnswerId { get; set; }
		public string AnswerName { get; set; } = string.Empty;
		public bool IsCorrect { get; set; }
		public bool IsActive { get; set; }
		public string? Image { get; set; }
	}
}
