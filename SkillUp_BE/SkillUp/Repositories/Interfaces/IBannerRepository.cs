using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IBannerRepository
    {
        Task<List<Banner>> GetActiveBannersAsync();
    }
}
