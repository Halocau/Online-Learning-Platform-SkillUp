namespace SkillUp.BussinessObjects.DTOs.Question
{
    public class CreateQuestionDTO
    {
        public Guid QuizId { get; set; } 

        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public float? Orders { get; set; }
        public string? ImageUrl { get; set; }
        public string Type { get; set; } = string.Empty;
        public List<CreateAnswerDTO> Answers { get; set; } = new List<CreateAnswerDTO>();
    }
}
