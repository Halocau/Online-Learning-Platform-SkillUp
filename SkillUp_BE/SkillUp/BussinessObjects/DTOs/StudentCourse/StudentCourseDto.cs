namespace SkillUp.BussinessObjects.DTOs.StudentCourse
{
    public class StudentCourseDto
    {
        public Guid CourseId { get; set; }
        public string Title { get; set; }
        public string Image { get; set; }
        public string LecturerName { get; set; }
        public int CompletedItems { get; set; }
        public int TotalItems { get; set; }
        public double ProgressPercentage { get; set; }
        public DateTime? EnrolledAt { get; set; }
    }
}
