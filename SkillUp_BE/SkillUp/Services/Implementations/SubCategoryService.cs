using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.DTOs;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SkillUp.Services.Implementations
{
    public class SubCategoryService : ISubCategoryService
    {
        private readonly ISubCategoryRepository _subCategoryRepository;
        private readonly SkillUpContext _context;

        public SubCategoryService(ISubCategoryRepository subCategoryRepository, SkillUpContext context)
        {
            _subCategoryRepository = subCategoryRepository;
            _context = context;
        }

        public async Task<IEnumerable<SubCategoryDto>> GetAllSubCategoriesAsync()
        {
            var list = await _subCategoryRepository.GetAllSubCategoriesAsync();
            return list.Select(sc => new SubCategoryDto
            {
                Id = sc.Id,
                Name = sc.Name,
                CategoryId = sc.CategoryId,
                CategoryName = sc.Category?.Name,
                IsActive = sc.IsActive
            });
        }

        public async Task<SubCategoryDto?> GetSubCategoryByIdAsync(int id)
        {
            var sc = await _subCategoryRepository.GetSubCategoryByIdAsync(id);
            if (sc == null) return null;

            return new SubCategoryDto
            {
                Id = sc.Id,
                Name = sc.Name,
                CategoryId = sc.CategoryId,
                CategoryName = sc.Category?.Name,
                IsActive = sc.IsActive
            };
        }

        public async Task<SubCategoryDto> CreateSubCategoryAsync(SubCategoryDto dto)
        {
            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == dto.CategoryId);
            if (!categoryExists)
                throw new System.Exception("CategoryId không hợp lệ.");

            var subCategory = new SubCategory
            {
                Name = dto.Name,
                CategoryId = dto.CategoryId,
                IsActive = true
            };

            await _subCategoryRepository.AddSubCategoryAsync(subCategory);
            await _subCategoryRepository.SaveChangesAsync();

            dto.Id = subCategory.Id;
            return dto;
        }

        public async Task<bool> UpdateSubCategoryAsync(int id, SubCategoryDto dto)
        {
            var existing = await _subCategoryRepository.GetSubCategoryByIdAsync(id);
            if (existing == null) return false;

            existing.Name = dto.Name;
            existing.CategoryId = dto.CategoryId;
            existing.IsActive = dto.IsActive;

            await _subCategoryRepository.UpdateSubCategoryAsync(existing);
            await _subCategoryRepository.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteSubCategoryAsync(int id)
        {
            var existing = await _subCategoryRepository.GetSubCategoryByIdAsync(id);
            if (existing == null) return false;

            existing.IsActive = false;
            await _subCategoryRepository.UpdateSubCategoryAsync(existing);
            await _subCategoryRepository.SaveChangesAsync();
            return true;
        }
    }
}
