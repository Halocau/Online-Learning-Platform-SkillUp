using Microsoft.EntityFrameworkCore; // Đảm bảo bạn đã import
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using System.Collections.Generic;
using System.Linq;

namespace SkillUp.Repositories.Implementations // Hoặc namespace của bạn
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly SkillUpContext _context; // Tên DbContext của bạn

        public CategoryRepository(SkillUpContext context)
        {
            _context = context;
        }

        public IEnumerable<Category> GetAll()
        {
            return _context.Categories.ToList();
        }

        // V TRIỂN KHAI PHƯƠNG THỨC MỚI V
        public IEnumerable<Category> GetAllWithSubCategories()
        {
            // Dùng .Include() để tải SubCategories
            return _context.Categories.Include(c => c.SubCategories).ToList();
        }
        // ^ TRIỂN KHAI PHƯƠNG THỨC MỚI ^

        public Category? GetById(int id)
        {
            return _context.Categories.Find(id);
        }

        public Category? GetByIdWithSubCategories(int id)
        {
            return _context.Categories
                           .Include(c => c.SubCategories)
                           .FirstOrDefault(c => c.Id == id);
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
    }
}