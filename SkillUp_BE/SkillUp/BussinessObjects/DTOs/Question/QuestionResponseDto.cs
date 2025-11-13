namespace SkillUp.BussinessObjects.DTOs.Question
{
    public class QuestionResponseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public float? Orders { get; set; }
        public List<AnswerResponseDto> Answers { get; set; }
    }
}
