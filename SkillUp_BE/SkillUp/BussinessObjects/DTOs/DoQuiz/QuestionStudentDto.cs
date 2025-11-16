namespace SkillUp.BussinessObjects.DTOs.DoQuiz
{
    public class QuestionStudentDto
    {
        public Guid QuestionId { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public string? Image { get; set; }
        public string Type { get; set; } 
        public List<AnswerStudentDto> Answers { get; set; } = new();
    }
}
