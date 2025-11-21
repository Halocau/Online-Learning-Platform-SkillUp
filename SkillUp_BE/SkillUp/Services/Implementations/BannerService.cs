using SkillUp.BussinessObjects.DTOs.Banner;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
	public class BannerService : IBannerService
	{
		private readonly IBannerRepository _bannerRepository;
		private readonly ICurrentUserService _currentUserService;

		public BannerService(IBannerRepository bannerRepository, ICurrentUserService currentUserService)
		{
			_bannerRepository = bannerRepository;
			_currentUserService = currentUserService;
		}

		public async Task<BannerViewDTO> CreateBanner(BannerCreateDTO bannerCreateDTO, string file)
		{
			Banner banner = new Banner
			{
				Image = file,
				Hyperlink = bannerCreateDTO.Hyperlink,
				IsActive = bannerCreateDTO.IsActive,
				Title = bannerCreateDTO.Title,
				Description = bannerCreateDTO.Description,
				Email = _currentUserService.Email
			};
			await _bannerRepository.CreateBannerAsync(banner);
			var success = await _bannerRepository.SaveChangesAsync();
			if (!success)
			{
				throw new Exception("Tạo banner mới thất bại");
			}
			return new BannerViewDTO
			{
				Image = banner.Image,
				Hyperlink = banner.Hyperlink,
				IsActive = banner.IsActive,
				Title = banner.Title,
				Description = banner.Description,
				Email = banner.Email
			};
		}

		public async Task<List<BannerViewDTO>> GetActiveBanners()
		{
			var banners = await _bannerRepository.GetActiveBannersAsync();
			var bannerDTOs = banners.Select(b => new BannerViewDTO
			{
				Id = b.Id,
				Image = b.Image,
				Hyperlink = b.Hyperlink,
				IsActive = b.IsActive,
				Title = b.Title,
				Description = b.Description,
				Email = b.Email,
			}).ToList();
			return bannerDTOs;
		}

		public async Task<List<BannerViewDTO>> GetAllBanners()
		{
			var banners = await _bannerRepository.GetAllBannersAsync();
			var bannerDTOs = banners.Select(b => new BannerViewDTO
			{
				Id = b.Id,
				Image = b.Image,
				Hyperlink = b.Hyperlink,
				IsActive = b.IsActive,
				Title = b.Title,
				Description = b.Description,
				Email = b.Email,
			}).ToList();
			return bannerDTOs;
		}

		public async Task<BannerViewDTO> GetBannerById(int id)
		{
			var banner = await _bannerRepository.GetBannerByIdAsync(id);
			if (banner == null)
			{
				throw new Exception("Không tìm thấy banner!");
			}
			return new BannerViewDTO
			{
				Id = banner.Id,
				Image = banner.Image,
				Hyperlink = banner.Hyperlink,
				IsActive = banner.IsActive,
				Title = banner.Title,
				Description = banner.Description,
				Email = banner.Email,
			};
		}

		public async Task<BannerViewDTO> ToggleBanner(int id, bool isActive)
		{
			var existingBanner = await _bannerRepository.GetBannerByIdAsync(id);
			if (existingBanner == null)
			{
				throw new Exception("Không tìm thấy banner!");
			}
			existingBanner.IsActive = isActive;
			_bannerRepository.UpdateBanner(existingBanner);
			await _bannerRepository.SaveChangesAsync();
			return new BannerViewDTO
			{
				Id = id,
				Image = existingBanner.Image,
				Hyperlink = existingBanner.Hyperlink,
				IsActive = existingBanner.IsActive,
				Title = existingBanner.Title,
				Description = existingBanner.Description,
				Email = existingBanner.Email
			};
		}

		public async Task<BannerViewDTO> UpdateBanner(BannerUpdateDTO bannerUpdateDTO, string file)
		{
			var existingBanner = await _bannerRepository.GetBannerByIdAsync(bannerUpdateDTO.Id);
			if (existingBanner == null)
			{
				throw new Exception("Không tìm thấy banner!");
			}
			if (file != null)
			{
				existingBanner.Image = file;
			}
			existingBanner.Hyperlink = bannerUpdateDTO.Hyperlink;
			existingBanner.IsActive = bannerUpdateDTO.IsActive;
			existingBanner.Title = bannerUpdateDTO.Title;
			existingBanner.Description = bannerUpdateDTO.Description;

			_bannerRepository.UpdateBanner(existingBanner);
			var success = await _bannerRepository.SaveChangesAsync();
			if (!success)
			{
				throw new Exception("Cập nhật banner thất bại");
			}
			return new BannerViewDTO
			{
				Id = existingBanner.Id,
				Image = existingBanner.Image,
				Hyperlink = existingBanner.Hyperlink,
				IsActive = existingBanner.IsActive,
				Title = existingBanner.Title,
				Description = existingBanner.Description,
				Email = existingBanner.Email
			};
		}
	}
}
