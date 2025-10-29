using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;

namespace SkillUp.Repositories.Implementations
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly SkillUpContext _context;

        public CategoryRepository(SkillUpContext context)
        {
            _context = context;
        }

        public IEnumerable<Category> GetAll()
        {
            return _context.Categories
                .Where(c => c.IsActive)
                .ToList();
        }

        public IEnumerable<Category> GetAllWithSubCategories()
        {
            return _context.Categories
                .Where(c => c.IsActive)
                .Include(c => c.SubCategories.Where(sc => sc.IsActive))
                .ToList();
        }

        public Category? GetById(int id)
        {
            return _context.Categories.FirstOrDefault(c => c.Id == id);
        }

        public Category? GetByIdWithSubCategories(int id)
        {
            return _context.Categories
                .Where(c => c.Id == id && c.IsActive)
                .Include(c => c.SubCategories.Where(sc => sc.IsActive))
                .FirstOrDefault();
        }

        // 🔍 Kiểm tra tên danh mục trùng
        public Category? GetByName(string name)
        {
            return _context.Categories
                .FirstOrDefault(c => c.Name.ToLower() == name.ToLower());
        }

        public void Add(Category category)
        {
            _context.Categories.Add(category);
        }

        public void Update(Category category)
        {
            _context.Categories.Update(category);
        }

        public void Save()
        {
            _context.SaveChanges();
        }

        public async Task<List<Category>> GetCategoriesWithSubCategoriesAsync()
        {
            return await _context.Categories
                .Where(c => c.IsActive == true)            
                .Include(c => c.SubCategories.Where(sc => sc.IsActive == true))
                .ToListAsync();
        }
    }
}
