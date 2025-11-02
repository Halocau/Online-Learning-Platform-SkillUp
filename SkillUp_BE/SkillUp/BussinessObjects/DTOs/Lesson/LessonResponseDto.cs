namespace SkillUp.BussinessObjects.DTOs.Lesson
{
    public class LessonResponseDto
    {
        public Guid Id { get; set; }
        public Guid SectionId { get; set; }
        public string SectionTitle { get; set; } = null!;
        public string Title { get; set; } = null!;
        public string Type { get; set; } = null!;
        public string? Description { get; set; }
        public double LessonOrder { get; set; }
        public bool IsFree { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Asset information
        public string? VideoUrl { get; set; }
        public string? TextContent { get; set; }
    }
}
