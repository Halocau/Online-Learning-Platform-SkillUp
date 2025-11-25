using System.Collections.ObjectModel;

namespace SkillUp.BussinessObjects.DTOs.Subtitle
{
    public class SubtitleCourseJobResult
    {
        public Guid CourseId { get; set; }
        public int TotalLessons { get; set; }
        public int CompletedLessons { get; set; }
        public int FailedLessons { get; set; }
        public bool Success => FailedLessons == 0;
        public List<SubtitleGenerationJobResult> LessonResults { get; set; } = new();
        public DateTime ExecutedAt { get; set; } = DateTime.UtcNow;
    }
}




