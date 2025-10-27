using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SkillUp.Repositories.Implementations
{
    public class SubCategoryRepository : ISubCategoryRepository
    {
        private readonly SkillUpContext _context;

        public SubCategoryRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SubCategory>> GetAllSubCategoriesAsync()
        {
            // ✅ Lấy cả Category để tiện map DTO, nhưng chỉ lọc Active ở Service
            return await _context.SubCategories
                .Include(sc => sc.Category)
                .ToListAsync();
        }

        public async Task<SubCategory?> GetSubCategoryByIdAsync(int id)
        {
            return await _context.SubCategories
                .Include(sc => sc.Category)
                .FirstOrDefaultAsync(sc => sc.Id == id);
        }

        public async Task AddSubCategoryAsync(SubCategory subCategory)
        {
            await _context.SubCategories.AddAsync(subCategory);
        }

        public Task UpdateSubCategoryAsync(SubCategory subCategory)
        {
            _context.SubCategories.Update(subCategory);
            return Task.CompletedTask;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
