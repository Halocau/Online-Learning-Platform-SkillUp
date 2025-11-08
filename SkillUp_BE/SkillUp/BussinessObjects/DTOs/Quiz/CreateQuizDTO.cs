namespace SkillUp.BussinessObjects.DTOs.Quiz
{
    public class CreateQuizDTO
    {
        public Guid SectionId { get; set; }
        public string Title { get; set; } = string.Empty;
        public double? Orders { get; set; }
        public string? Description { get; set; }
        public int PassPercent { get; set; } = 70;
        public int Timer { get; set; } = 10;
    }
}
