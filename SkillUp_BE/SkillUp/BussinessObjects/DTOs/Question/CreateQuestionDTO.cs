namespace SkillUp.BussinessObjects.DTOs.Question
{
    public class CreateQuestionDTO
    {
        public Guid QuizId { get; set; } 

        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public float? Orders { get; set; }
        public IFormFile? Image { get; set; }

        public List<CreateAnswerDTO> Answers { get; set; } = new List<CreateAnswerDTO>();
    }
}
