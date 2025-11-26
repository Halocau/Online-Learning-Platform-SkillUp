namespace SkillUp.BussinessObjects.DTOs.ReportCourse
{
    public class ReportCourseResponseDto
    {
        public Guid Id { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; } = null!;
        public DateTime? CreatedAt { get; set; }
        public string CourseName { get; set; } = null!;
        public string StudentName { get; set; } = null!;
    }
}