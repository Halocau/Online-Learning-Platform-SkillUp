using SkillUp.BussinessObjects.DTOs.Asset;

namespace SkillUp.BussinessObjects.DTOs.Section
{
    public class SectionItemLearningDto
    {
        // "Lesson" | "Quiz"
        public string Kind { get; set; } = "";
        public Guid Id { get; set; }
        public double Orders { get; set; }
        public string Title { get; set; } = "";
        public string? Description { get; set; }

        // ---- Lesson-only fields ----
        public string? LessonType { get; set; }         // "Video" | "Text"
        public bool? IsFree { get; set; }
        public List<AssetCourseDetailDto>? Assets { get; set; }

        // ---- Quiz-only fields ----
        public int? PassPercent { get; set; }
        public int? Timer { get; set; }
        public Guid? QuizSubmissionId { get; set; }

        // ---- Learning-specific fields ----
        public bool? IsCompleted { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}

