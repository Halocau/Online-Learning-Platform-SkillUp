using SkillUp.BussinessObjects.DTOs.Category;
using SkillUp.BussinessObjects.Models;
using System.Collections.Generic;

namespace SkillUp.Services.Interfaces
{
    public interface ICategoryService
    {
        IEnumerable<Category> GetAll();
        IEnumerable<Category> GetAllWithSubCategories();
        Category? GetById(int id);
        Category? GetByIdWithSubCategories(int id);
        Category Create(CategoryRequestDto request);
        Category Update(int id, CategoryRequestDto request);
        Category Delete(int id);
    }
}
