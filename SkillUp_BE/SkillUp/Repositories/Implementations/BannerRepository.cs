using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class BannerRepository : IBannerRepository
    {
        private readonly SkillUpContext _context;

        public BannerRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<List<Banner>> GetActiveBannersAsync()
        {
            return await _context.Banners
                .Where(b => b.IsActive == true)
                .ToListAsync();
        }
    }
}
