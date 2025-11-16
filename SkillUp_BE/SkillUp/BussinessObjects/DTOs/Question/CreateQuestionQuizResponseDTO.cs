namespace SkillUp.BussinessObjects.DTOs.Question
{
	public class CreateQuestionQuizResponseDTO
	{
		public Guid Id { get; set; }

		public Guid QuestionBankId { get; set; }

		public Guid QuizId { get; set; }

		public string Title { get; set; } = null!;

		public double? Orders { get; set; }
	}
}
