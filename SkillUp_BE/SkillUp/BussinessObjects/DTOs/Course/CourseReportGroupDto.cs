namespace SkillUp.BussinessObjects.DTOs.ReportCourse
{
    public class CourseReportGroupDto
    {
        public Guid CourseId { get; set; }
        public string CourseName { get; set; } = null!;
        public int TotalCount { get; set; }
        public int PendingCount { get; set; }
        public int ResolvedCount { get; set; }
        public List<ReportCourseResponseDto> Reports { get; set; } = new();
    }
}

