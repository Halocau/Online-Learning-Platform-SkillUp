namespace SkillUp.BussinessObjects.DTOs.Question
{
    public class UpdateQuestionDTO
    {
      
        public Guid QuizId { get; set; }

        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public string Type { get; set; }

        public string? ImageUrl { get; set; }

        public List<UpdateAnswerDTO> Answers { get; set; } = new();
    }
}
