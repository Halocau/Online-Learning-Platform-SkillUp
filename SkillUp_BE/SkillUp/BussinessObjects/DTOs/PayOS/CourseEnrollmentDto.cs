namespace SkillUp.BussinessObjects.DTOs.PayOS
{
    public class CourseEnrollmentDto
    {
        public Guid CourseId { get; set; }
        public string CourseName { get; set; } = null!;
        public decimal Price { get; set; }
        public DateTime EnrolledAt { get; set; }
    }
}
