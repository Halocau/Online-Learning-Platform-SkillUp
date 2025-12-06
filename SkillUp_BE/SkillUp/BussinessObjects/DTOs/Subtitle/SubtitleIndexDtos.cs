namespace SkillUp.BussinessObjects.DTOs.Subtitle
{
    public class SubtitleIndexRequest
    {
        public Guid LessonId { get; set; }
        public Guid CourseId { get; set; }
        public string LessonTitle { get; set; } = string.Empty;
        public string SubtitleText { get; set; } = string.Empty;
        public string? SourceVideoUrl { get; set; }
    }

    public class SubtitleIndexResult
    {
        public Guid LessonId { get; set; }
        public int ChunkCount { get; set; }
        public DateTime IndexedAt { get; set; } = DateTime.UtcNow;
    }
}

