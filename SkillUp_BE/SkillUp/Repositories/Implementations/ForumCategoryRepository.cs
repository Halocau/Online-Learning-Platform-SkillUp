using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class ForumCategoryRepository : IForumCategoryRepository
    {
        private readonly SkillUpContext _context;

        public ForumCategoryRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<bool> ExistsByNameAsync(string name, int? excludeId = null)
        {
            return await _context.ForumCategories
                .AnyAsync(c => c.Name.ToLower() == name.ToLower() &&
                              (!excludeId.HasValue || c.Id != excludeId.Value));
        }

        public async Task AddAsync(ForumCategory category)
        {
            _context.ForumCategories.Add(category);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(ForumCategory category)
        {
            _context.ForumCategories.Update(category);
            await _context.SaveChangesAsync();
        }

        public async Task<ForumCategory?> GetByIdAsync(int id)
        {
            return await _context.ForumCategories.FindAsync(id);
        }

        public async Task<List<ForumCategory>> GetAllAsync()
        {
            return await _context.ForumCategories.ToListAsync();
        }
    }
}
