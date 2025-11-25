namespace SkillUp.BussinessObjects.DTOs.Subtitle
{
    public class SubtitleGenerationJobResult
    {
        public Guid LessonId { get; set; }
        public Guid CourseId { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public SubtitleIndexResult? IndexResult { get; set; }
        public string? SourceVideoUrl { get; set; }
        public TimeSpan? GenSubDuration { get; set; }
        public DateTime ExecutedAt { get; set; } = DateTime.Now;
    }
}




