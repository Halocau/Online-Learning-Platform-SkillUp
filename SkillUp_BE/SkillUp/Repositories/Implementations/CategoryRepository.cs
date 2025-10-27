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

        // 🔹 Chỉ lấy các Category đang hoạt động
        public IEnumerable<Category> GetAll()
        {
            return _context.Categories
                .Where(c => c.IsActive)
                .ToList();
        }

        // 🔹 Lấy Category + SubCategory đang active
        public IEnumerable<Category> GetAllWithSubCategories()
        {
            return _context.Categories
                .Where(c => c.IsActive)
                .Include(c => c.SubCategories.Where(sc => sc.IsActive))
                .ToList();
        }

        // 🔹 Lấy Category theo ID
        public Category? GetById(int id)
        {
            return _context.Categories.FirstOrDefault(c => c.Id == id);
        }

        // 🔹 Lấy Category theo ID và các SubCategory active
        public Category? GetByIdWithSubCategories(int id)
        {
            return _context.Categories
                .Where(c => c.Id == id && c.IsActive)
                .Include(c => c.SubCategories.Where(sc => sc.IsActive))
                .FirstOrDefault();
        }

        // 🔹 Thêm mới Category
        public void Add(Category category)
        {
            _context.Categories.Add(category);
        }

        // 🔹 Cập nhật Category
        public void Update(Category category)
        {
            _context.Categories.Update(category);
        }

        // 🔹 Lưu thay đổi
        public void Save()
        {
            _context.SaveChanges();
        }
    }
}
