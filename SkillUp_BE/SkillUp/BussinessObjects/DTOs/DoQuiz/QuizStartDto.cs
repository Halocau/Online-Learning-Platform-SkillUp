namespace SkillUp.BussinessObjects.DTOs.DoQuiz
{
    public class QuizStartDto
    {
        public Guid SubmissionId { get; set; }

        public Guid QuizId { get; set; }
        public string Title { get; set; }
        public int? Timer { get; set; } 
        public List<QuestionStudentDto> Questions { get; set; } = new();
    }
}
