using SkillUp.BussinessObjects.DTOs.Asset;

namespace SkillUp.BussinessObjects.DTOs.Lesson
{
    public class GetLessonResponseDto
    {
        public Guid Id { get; set; }
        public double Orders { get; set; }
        public string Title { get; set; }
        public string Type { get; set; } // Video, Document, etc.
        public string Description { get; set; }
        public bool IsFree { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<AssetGetLessonResponseDto> Assets { get; set; }
    }
}
