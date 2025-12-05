namespace SkillUp.BussinessObjects.DTOs.Lecturer
{
    public class EnrolledStudentDto
    {
        public Guid StudentId { get; set; }
        public string StudentName { get; set; }
        public string Email { get; set; }
        public string Avatar { get; set; }

        public Guid CourseId { get; set; }
        public string CourseTitle { get; set; }
        public DateTime EnrolledAt { get; set; }

        public int CompletedLessons { get; set; }
        public int TotalLessons { get; set; }
        public double ProgressPercent { get; set; }
    }
}
