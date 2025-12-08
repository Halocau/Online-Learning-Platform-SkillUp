using SkillUp.BussinessObjects.DTOs.Asset;
using SkillUp.BussinessObjects.DTOs.Question;
using System.Text.Json.Serialization;

namespace SkillUp.BussinessObjects.DTOs.Section
{
    public class SectionItemDto
    {
        // "Lesson" | "Quiz"
        public string Kind { get; set; } = "";
        public Guid Id { get; set; }
        public double Orders { get; set; }
        public string Title { get; set; } = "";
        public string? Description { get; set; }

        // ---- Lesson-only fields ----
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? LessonType { get; set; }         // "Video" | "Text"
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? IsFree { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public List<AssetCourseDetailDto>? Assets { get; set; }

        // ---- Quiz-only fields ----
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? PassPercent { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public int? Timer { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public Guid? QuizSubmissionId { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public bool? IsCompleted { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public List<QuestionDetailDTO>? Questions { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
