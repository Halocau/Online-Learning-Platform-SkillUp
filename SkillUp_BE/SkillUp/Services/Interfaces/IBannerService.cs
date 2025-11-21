using SkillUp.BussinessObjects.DTOs.Banner;

namespace SkillUp.Services.Interfaces
{
	public interface IBannerService
	{
		Task<List<BannerViewDTO>> GetActiveBanners();
		Task<List<BannerViewDTO>> GetAllBanners();
		Task<BannerViewDTO> GetBannerById(int id);
		Task<BannerViewDTO> CreateBanner(BannerCreateDTO bannerCreateDTO, string file);
		Task<BannerViewDTO> UpdateBanner(BannerUpdateDTO bannerUpdateDTO, string? file);
		Task<BannerViewDTO> ToggleBanner(int id, bool isActive);
	}
}
