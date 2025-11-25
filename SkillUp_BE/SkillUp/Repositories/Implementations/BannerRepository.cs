using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class BannerRepository : IBannerRepository
    {
        private readonly SkillUp1Context _context;

        public BannerRepository(SkillUp1Context context)
        {
            _context = context;
        }

		public async Task<Banner> CreateBannerAsync(Banner banner)
		{
			await _context.Banners.AddAsync(banner);
			return banner;
		}

		public async Task<List<Banner>> GetActiveBannersAsync()
        {
            return await _context.Banners
                .Where(b => b.IsActive == true)
                .ToListAsync();
        }

		public async Task<List<Banner>> GetAllBannersAsync()
		{
			return await _context.Banners.ToListAsync();
		}

		public async Task<Banner?> GetBannerByIdAsync(int id)
		{
			return await _context.Banners.FindAsync(id);
		}

		public async Task<bool> SaveChangesAsync()
		{
			return await _context.SaveChangesAsync() > 0;
		}

		public void UpdateBanner(Banner banner)
		{
			_context.Banners.Update(banner);
		}
	}
}
