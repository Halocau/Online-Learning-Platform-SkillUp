using SkillUp.BussinessObjects.DTOs;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class SubCategoryService : ISubCategoryService
    {
        private readonly ISubCategoryRepository _repository;

        public SubCategoryService(ISubCategoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<SubCategoryDto>> GetAllSubCategoriesAsync()
        {
            var subCategories = await _repository.GetAllActiveAsync();
            return subCategories.Select(sc => new SubCategoryDto
            {
                Id = sc.Id,
                CategoryId = sc.CategoryId,
                Name = sc.Name,
                IsActive = sc.IsActive
            });
        }

        public async Task<SubCategoryDto?> GetSubCategoryByIdAsync(int id)
        {
            var sc = await _repository.GetByIdAsync(id);
            if (sc == null) return null;

            return new SubCategoryDto
            {
                Id = sc.Id,
                CategoryId = sc.CategoryId,
                Name = sc.Name,
                IsActive = sc.IsActive
            };
        }

        public async Task<SubCategoryDto> CreateSubCategoryAsync(SubCategoryCreateRequest request)
        {
            // Kiểm tra trùng tên
            var existing = await _repository.GetByNameAsync(request.Name);
            if (existing != null)
                throw new Exception("Tên SubCategory đã tồn tại.");

            var subCategory = new SubCategory
            {
                CategoryId = request.CategoryId,
                Name = request.Name,
                IsActive = true
            };

            await _repository.CreateAsync(subCategory);
            await _repository.SaveChangesAsync();

            return new SubCategoryDto
            {
                Id = subCategory.Id,
                CategoryId = subCategory.CategoryId,
                Name = subCategory.Name,
                IsActive = subCategory.IsActive
            };
        }

        public async Task UpdateSubCategoryAsync(int id, SubCategoryUpdateRequest request)
        {
            var subCategory = await _repository.GetByIdAsync(id)
                ?? throw new Exception("Không tìm thấy SubCategory.");

            subCategory.Name = request.Name;
            subCategory.IsActive = request.IsActive;

            await _repository.UpdateAsync(subCategory);
            await _repository.SaveChangesAsync();
        }

        public async Task DeleteSubCategoryAsync(int id)
        {
            var subCategory = await _repository.GetByIdAsync(id)
                ?? throw new Exception("Không tìm thấy SubCategory.");

            await _repository.DeleteAsync(subCategory);
            await _repository.SaveChangesAsync();
        }
    }
}
