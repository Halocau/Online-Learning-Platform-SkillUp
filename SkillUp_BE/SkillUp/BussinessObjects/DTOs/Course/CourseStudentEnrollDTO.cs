namespace SkillUp.BussinessObjects.DTOs.Course
{
    public class CourseStudentEnrollDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string? Description { get; set; }
        public string Image { get; set; }
        public decimal? Price { get; set; }
        public double? Rating { get; set; }
        public int EnrollmentCount { get; set; }
        public string LecturerName { get; set; }
        public int SubCategoryId { get; set; }
        public string? SubCategoryName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime EnrolledAt { get; set; }
    }
}
