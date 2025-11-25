namespace SkillUp.BussinessObjects.DTOs.DoQuiz
{
    public class QuizResultDetailDto
    {
        public Guid SubmissionId { get; set; }
        public string QuizTitle { get; set; }
        public string? QuizDescription { get; set; }
        public decimal? Score { get; set; }
        public bool IsPassed { get; set; }
        public DateTime? EndedAt { get; set; }
        public List<QuestionResultDetailDto> Questions { get; set; } = new();
    }
    public class QuestionResultDetailDto
    {
        public Guid QuestionId { get; set; }
        public string Title { get; set; }
        public string? Image { get; set; }
        public string Type { get; set; } 
        public bool IsQuestionCorrect { get; set; }

        public List<AnswerResultDetailDto> AllAnswers { get; set; } = new();
    }
    public class AnswerResultDetailDto
    {
        public Guid AnswerId { get; set; }
        public string AnswerName { get; set; }
        public bool IsCorrect { get; set; }
        public bool WasSelected { get; set; }
        public string? Image { get; set; }
    }
}
