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
            return _context.Categories.ToList();
        }

        public Category? GetById(int id)
        {
            return _context.Categories.FirstOrDefault(c => c.Id == id);
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
