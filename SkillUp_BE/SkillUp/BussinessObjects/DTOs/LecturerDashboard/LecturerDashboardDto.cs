namespace SkillUp.BussinessObjects.DTOs.LecturerDashboard
{
    public class LecturerDashboardDto
    {
        public int TotalCourses { get; set; }
        public int TotalStudents { get; set; }
        public decimal CurrentMonthEarnings { get; set; }
        public List<CourseDashboardSummaryDto> Courses { get; set; }
    }
    public class CourseDashboardSummaryDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Image { get; set; }
        public int TotalStudents { get; set; } 
        public int TotalLessons { get; set; }  
    }
}
