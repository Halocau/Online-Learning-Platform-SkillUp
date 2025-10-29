using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.DTOs;
using SkillUp.BussinessObjects.DTOs.Category;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class ForumCategoryService : IForumCategoryService
    {
        private readonly IForumCategoryRepository _repository;

        public ForumCategoryService(IForumCategoryRepository repository)
        {
            _repository = repository;
        }

        public async Task<ApiResponse> CreateAsync(ForumCategoryDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
                return ApiResponse.BadRequest("Tên danh mục không được để trống.");

            bool exists = await _repository.ExistsByNameAsync(dto.Name);
            if (exists)
                return ApiResponse.Conflict("Danh mục đã tồn tại.");

            var newCategory = new ForumCategory
            {
                Name = dto.Name,
                IsActive = dto.IsActive
            };

            await _repository.AddAsync(newCategory);
            dto.Id = newCategory.Id;

            return ApiResponse.Ok("Tạo danh mục thành công.", dto);
        }

        public async Task<ApiResponse> UpdateAsync(int id, ForumCategoryDto dto)
        {
            var category = await _repository.GetByIdAsync(id);
            if (category == null)
                return ApiResponse.NotFound("Không tìm thấy danh mục.");

            bool exists = await _repository.ExistsByNameAsync(dto.Name, id);
            if (exists)
                return ApiResponse.Conflict("Tên danh mục đã tồn tại.");

            category.Name = dto.Name;
            category.IsActive = dto.IsActive;

            await _repository.UpdateAsync(category);
            dto.Id = category.Id;

            return ApiResponse.Ok("Cập nhật thành công.", dto);
        }

        public async Task<ApiResponse> DeleteAsync(int id)
        {
            var category = await _repository.GetByIdAsync(id);
            if (category == null)
                return ApiResponse.NotFound("Không tìm thấy danh mục.");

            if (!category.IsActive)
                return ApiResponse.BadRequest("Danh mục này đã bị vô hiệu hóa.");

            category.IsActive = false;
            await _repository.UpdateAsync(category);

            return ApiResponse.Ok("Vô hiệu hóa danh mục thành công.", new
            {
                category.Id,
                category.Name,
                category.IsActive
            });
        }
    
        public async Task<ApiResponse> GetAllAsync()
        {
            var list = await _repository.GetAllAsync();
            if (!list.Any())
                return ApiResponse.Ok("Không có danh mục nào.", new List<ForumCategoryDto>());

            var data = list.Select(c => new ForumCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                IsActive = c.IsActive
            }).ToList();

            return ApiResponse.Ok("Lấy danh sách thành công.", data);
        }
    }
}
