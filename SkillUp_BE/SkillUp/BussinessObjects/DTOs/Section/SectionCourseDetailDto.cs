using SkillUp.BussinessObjects.DTOs.Lesson;

namespace SkillUp.BussinessObjects.DTOs.Section
{
    public class SectionCourseDetailDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<LessonCourseDetailDto> Lessons { get; set; }
    }
}
