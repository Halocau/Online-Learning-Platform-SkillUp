namespace SkillUp.BussinessObjects.DTOs.Question
{
    public class QuestionResponseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public float? Orders { get; set; }
        public string? Image { get; set; } 
        public string Type { get; set; } = string.Empty;
        public List<AnswerResponseDto> Answers { get; set; }
    }
}
