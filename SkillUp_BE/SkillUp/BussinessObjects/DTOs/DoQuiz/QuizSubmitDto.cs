namespace SkillUp.BussinessObjects.DTOs.DoQuiz
{
    public class QuizSubmitDto
    {
        public List<StudentAnswerSubmitDto> Answers { get; set; } = new();
    }
    public class StudentAnswerSubmitDto
    {
        public Guid QuestionId { get; set; }
        public List<Guid> SelectedAnswerIds { get; set; } = new();
    }
}
