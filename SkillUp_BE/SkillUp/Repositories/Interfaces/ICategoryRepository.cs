using SkillUp.BussinessObjects.Models;
using System.Collections.Generic;

namespace SkillUp.Repositories.Interfaces
{
    public interface ICategoryRepository
    {
        IEnumerable<Category> GetAll();
        IEnumerable<Category> GetAllWithSubCategories();
        Category? GetById(int id);
        Category? GetByIdWithSubCategories(int id);
        Category? GetByName(string name);
        void Add(Category category);
        void Update(Category category);
        void Save();
    }
}
