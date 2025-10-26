using SkillUp.BussinessObjects.DTOs.Category;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using System;
using System.Collections.Generic;

namespace SkillUp.Services.Implementations
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _repo;

        public CategoryService(ICategoryRepository repo)
        {
            _repo = repo;
        }

        public IEnumerable<Category> GetAll()
        {
            return _repo.GetAll();
        }

        // V THÊM PHƯƠNG THỨC NÀY V
        public IEnumerable<Category> GetAllWithSubCategories()
        {
            return _repo.GetAllWithSubCategories();
        }
        // ^ THÊM PHƯƠNG THỨC NÀY ^

        public Category? GetById(int id)
        {
            return _repo.GetById(id);
        }

        public Category? GetByIdWithSubCategories(int id)
        {
            return _repo.GetByIdWithSubCategories(id);
        }

        public Category Create(CategoryRequestDto request)
        {
            // ... (code khác giữ nguyên) ...
            if (string.IsNullOrWhiteSpace(request.Name))
                throw new ArgumentException("Tên danh mục không được để trống.");

            var category = new Category
            {
                Name = request.Name.Trim(),
                IsActive = true
            };

            _repo.Add(category);
            _repo.Save();

            return category;
        }

        public Category Update(int id, CategoryRequestDto request)
        {
            // ... (code khác giữ nguyên) ...
            var category = _repo.GetById(id)
                ?? throw new KeyNotFoundException("Không tìm thấy danh mục.");

            if (string.IsNullOrWhiteSpace(request.Name))
                throw new ArgumentException("Tên danh mục không được để trống.");

            category.Name = request.Name.Trim();
            category.IsActive = request.IsActive;

            _repo.Update(category);
            _repo.Save();

            return category;
        }

        public Category Delete(int id)
        {
            // ... (code khác giữ nguyên) ...
            var category = _repo.GetById(id)
                ?? throw new KeyNotFoundException("Không tìm thấy danh mục.");

            if (!category.IsActive)
                throw new InvalidOperationException("Danh mục này đã bị vô hiệu hóa trước đó.");

            category.IsActive = false;

            _repo.Update(category);
            _repo.Save();

            return category;
        }
    }
}