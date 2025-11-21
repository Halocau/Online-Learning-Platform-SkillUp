using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IBannerRepository
    {
        Task<List<Banner>> GetActiveBannersAsync();
        Task<List<Banner>> GetAllBannersAsync();
        Task<Banner?> GetBannerByIdAsync(int id);
        Task<Banner> CreateBannerAsync(Banner banner);
        void UpdateBanner(Banner banner);
        Task<bool> SaveChangesAsync();

    }
}
