namespace SkillUp.BussinessObjects.DTOs.Question
{
    public class AnswerResponseDto
    {
        public Guid Id { get; set; }
        public string AnswerName { get; set; }
        public bool IsCorrect { get; set; }
    }
}
