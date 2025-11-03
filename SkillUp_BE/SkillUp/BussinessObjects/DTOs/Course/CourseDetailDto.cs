using SkillUp.BussinessObjects.DTOs.Lecturer;
using SkillUp.BussinessObjects.DTOs.Section;

namespace SkillUp.BussinessObjects.DTOs.Course
{
    public class CourseDetailDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string Image { get; set; }
        public int EnrollmentCount { get; set; }
        public double Rating { get; set; }
        public string Status { get; set; }
        public bool IsActive { get; set; }
        public string CategoryName { get; set; }
        public string SubCategoryName { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public LecturerCourseDetailDto Lecturer { get; set; }
        public List<SectionCourseDetailDto> Sections { get; set; }
        
    }
}
