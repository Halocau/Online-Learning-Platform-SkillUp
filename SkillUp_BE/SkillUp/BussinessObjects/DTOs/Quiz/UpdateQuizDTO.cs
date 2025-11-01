namespace SkillUp.BussinessObjects.DTOs.Quiz
{
    public class UpdateQuizDTO
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int PassPercent { get; set; } = 70;
        public int Timer { get; set; } = 10;

    }
}
