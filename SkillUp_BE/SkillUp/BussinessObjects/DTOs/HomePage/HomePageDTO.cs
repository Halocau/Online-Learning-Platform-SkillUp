using SkillUp.BussinessObjects.DTOs.Banner;
using SkillUp.BussinessObjects.DTOs.Category;
using SkillUp.BussinessObjects.DTOs.Course;

namespace SkillUp.BussinessObjects.DTOs.HomePage
{
    public class HomePageDTO
    {
        public List<BannerDTO> Banners { get; set; }
        public List<CategoryHomePageDTO> Categories { get; set; }
        public List<CourseSummaryDTO> PopularCourses { get; set; }
        public List<CourseSummaryDTO> NewestCourses { get; set; }     
    }
}
