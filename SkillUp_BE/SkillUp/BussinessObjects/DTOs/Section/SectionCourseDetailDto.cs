using SkillUp.BussinessObjects.DTOs.Lesson;
using SkillUp.BussinessObjects.DTOs.Quiz;

namespace SkillUp.BussinessObjects.DTOs.Section
{
    public class SectionCourseDetailDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = "";
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Chỉ còn 1 danh sách để render
        public List<SectionItemDto> Items { get; set; } = new();
    }
}
