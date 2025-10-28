using SkillUp.BussinessObjects.DTOs.Banner;
using SkillUp.BussinessObjects.DTOs.Category;
using SkillUp.BussinessObjects.DTOs.Course;
using SkillUp.BussinessObjects.DTOs.HomePage;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class HomePageService : IHomePageService
    {
        private readonly IBannerRepository _bannerRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly ICourseRepository _courseRepository;    

        public HomePageService(
            IBannerRepository bannerRepository,
            ICategoryRepository categoryRepository,
            ICourseRepository courseRepository)
        {
            _bannerRepository = bannerRepository;
            _categoryRepository = categoryRepository;
            _courseRepository = courseRepository;
        }
        public async Task<HomePageDTO> GetHomePageDataAsync()
        {
            var banners = await _bannerRepository.GetActiveBannersAsync();
            var categories = await _categoryRepository.GetCategoriesWithSubCategoriesAsync();
            var popularCourses = await _courseRepository.GetPopularCoursesAsync(10);
            var newestCourses = await _courseRepository.GetNewestCoursesAsync(10);

            var bannerDTOs = banners.Select(b => new BannerDTO
            {
                Id = b.Id,
                Title = b.Title,
                Description = b.Description,
                Image = b.Image,
                Hyperlink = b.Hyperlink
            }).ToList();

            var categoryDTOs = categories.Select(c => new CategoryHomePageDTO
            {
                Id = c.Id,
                Name = c.Name,        
                SubCategories = c.SubCategories?.Select(sc => new SubCategoryHomePageDTO
                {
                    Id = sc.Id,
                    Name = sc.Name
                }).ToList() ?? new List<SubCategoryHomePageDTO>() 
            }).ToList();

            var popularCourseDTOs = popularCourses.Select(c => new CourseSummaryDTO
            {
                Id = c.Id,
                Title = c.Title,
                Image = c.Image,
                Price = c.Price,
                Rating = c.Rating,
                EnrollmentCount = c.EnrollmentCount,
                LecturerName = c.Lecturer?.Account?.Fullname
            }).ToList();

            var newestCourseDTOs = newestCourses.Select(c => new CourseSummaryDTO
            {
                Id = c.Id,
                Title = c.Title,
                Image = c.Image,
                Price = c.Price,
                Rating = c.Rating,
                EnrollmentCount = c.EnrollmentCount,
                LecturerName = c.Lecturer?.Account?.Fullname
            }).ToList();
          
            var homePageData = new HomePageDTO
            {
                Banners = bannerDTOs,
                Categories = categoryDTOs,
                PopularCourses = popularCourseDTOs,
                NewestCourses = newestCourseDTOs
            };

            return homePageData;
        }
    }
}
