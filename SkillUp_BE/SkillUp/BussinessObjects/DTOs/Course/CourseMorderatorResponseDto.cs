namespace SkillUp.BussinessObjects.DTOs.Course
{
    public class CourseMorderatorResponseDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Image { get; set; } 
        public decimal Price { get; set; } 
        public int EnrollmentCount { get; set; } 
        public double? Rating { get; set; }
        public string Status { get; set; } 
        public bool IsActive { get; set; } 
        public string SubCategoryName { get; set; } 
        public string LecturerName { get; set; }
    }
}
