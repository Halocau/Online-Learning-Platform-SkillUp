using SkillUp.BussinessObjects.DTOs.Question;

namespace SkillUp.BussinessObjects.DTOs.Quiz
{
    public class QuizDetailDTO
    {
        public Guid QuizId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public double? Orders { get; set; }
        public List<QuestionDetailDTO> Questions { get; set; } = new();
    }
}
