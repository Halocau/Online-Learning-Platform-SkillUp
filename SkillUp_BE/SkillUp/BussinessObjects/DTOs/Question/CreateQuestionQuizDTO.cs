namespace SkillUp.BussinessObjects.DTOs.Question
{
	public class CreateQuestionQuizDTO
	{
		public Guid QuestionBankId { get; set; }

		public Guid QuizId { get; set; }

		public double? Orders { get; set; }
	}
}
