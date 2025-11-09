using SkillUp.BussinessObjects.DTOs.Course;

namespace SkillUp.BussinessObjects.DTOs.CourseByCategoryPage
{
    public class CategoryPageDto
    {
        public CategorySimpleDto MainCategory { get; set; }
        public List<CategorySimpleDto> SubCategories { get; set; }
        public List<CourseSummaryDTO> Courses { get; set; }
    }
    public class CategorySimpleDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }
}
