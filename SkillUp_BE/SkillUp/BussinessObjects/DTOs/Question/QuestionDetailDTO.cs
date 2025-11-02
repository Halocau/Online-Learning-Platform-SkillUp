namespace SkillUp.BussinessObjects.DTOs.Question
{
    public class QuestionDetailDTO
    {
        public Guid QuestionId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public List<AnswerDetailDTO> Answers { get; set; } = new();
    }
}
