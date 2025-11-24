namespace SkillUp.BussinessObjects.DTOs.Course
{
    public class UpdateCourseDto
    {
        public string? Title { get; set; }

        public string? Description { get; set; }

        public IFormFile? Image { get; set; }
        public int? SubCategoryId { get; set; }
    }
}
