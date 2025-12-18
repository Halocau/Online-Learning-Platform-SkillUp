namespace SkillUp.BussinessObjects.DTOs.Subtitle
{
    public class SubtitleDto
    {
        public Guid LessonId { get; set; }
        public string LessonTitle { get; set; } = string.Empty;
        public string SubtitleText { get; set; } = string.Empty;
        public bool IsConfirmed { get; set; }
        public string? VideoUrl { get; set; }
    }

    public class SubtitleUpdateResult
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public int ChunkCount { get; set; }
        public DateTime? IndexedAt { get; set; }
    }
}

