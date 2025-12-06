namespace SkillUp.BussinessObjects.DTOs.Course
{
    public class CourseResponseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string? Image { get; set; }
        public string Status { get; set; }
        public Guid LecturerId { get; set; }
        public bool? IsAiSupport { get; set; }
    }
}
