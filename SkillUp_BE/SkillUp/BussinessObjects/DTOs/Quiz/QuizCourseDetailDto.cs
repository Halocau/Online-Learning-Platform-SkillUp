namespace SkillUp.BussinessObjects.DTOs.Quiz
{
    public class QuizCourseDetailDto
    {
        public Guid Id { get; set; }
        public double Orders { get; set; }
        public string Title { get; set; } 
        public string? Description { get; set; }
        public int? PassPercent { get; set; }
        public int? Timer { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
