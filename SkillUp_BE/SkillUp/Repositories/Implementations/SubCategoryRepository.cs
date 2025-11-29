using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class SubCategoryRepository : ISubCategoryRepository
    {
        private readonly SkillUpContext _context;

        public SubCategoryRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SubCategory>> GetAllActiveAsync()
        {
            return await _context.SubCategories
                .Where(sc => sc.IsActive)
                .ToListAsync();
        }

        public async Task<SubCategory?> GetByIdAsync(int id)
        {
            return await _context.SubCategories.FindAsync(id);
        }

        public async Task<SubCategory?> GetByNameAsync(string name)
        {
            return await _context.SubCategories
                .FirstOrDefaultAsync(sc => sc.Name.ToLower() == name.ToLower());
        }

        public async Task<SubCategory> CreateAsync(SubCategory subCategory)
        {
            await _context.SubCategories.AddAsync(subCategory);
            return subCategory;
        }

        public async Task UpdateAsync(SubCategory subCategory)
        {
            _context.SubCategories.Update(subCategory);
        }

        public async Task DeleteAsync(SubCategory subCategory)
        {
            _context.SubCategories.Remove(subCategory);
        }
        public async Task<SubCategory?> GetByNameAndCategoryAsync(string name, int categoryId)
        {
            var normalized = name.Trim().ToLower();
            return await _context.SubCategories
                .FirstOrDefaultAsync(sc => sc.CategoryId == categoryId && sc.Name.ToLower() == normalized);
        }


        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
