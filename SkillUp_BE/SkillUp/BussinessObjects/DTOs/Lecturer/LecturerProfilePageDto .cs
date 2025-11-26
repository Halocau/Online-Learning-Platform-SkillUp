using SkillUp.BussinessObjects.DTOs.Course;

namespace SkillUp.BussinessObjects.DTOs.Lecturer
{
    public class LecturerProfilePageDto
    {
        public Guid LecturerId { get; set; }
        public Guid AccountId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public string? Description { get; set; } 

        public string? Title { get; set; }
        public string? Profession { get; set; }

        public int TotalStudents { get; set; }
        public int TotalCourses { get; set; }
        public double AverageRating { get; set; }
        public List<CourseSummaryDTO> Courses { get; set; } = new();
    }
}
