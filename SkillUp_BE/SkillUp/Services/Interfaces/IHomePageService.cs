using SkillUp.BussinessObjects.DTOs.HomePage;

namespace SkillUp.Services.Interfaces
{
    public interface IHomePageService
    {
        Task<HomePageDTO> GetHomePageDataAsync();
    }
}
