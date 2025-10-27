using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs;
using SkillUp.Services.Interfaces;
using System.Threading.Tasks;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubCategoryController : ControllerBase
    {
        private readonly ISubCategoryService _subCategoryService;

        public SubCategoryController(ISubCategoryService subCategoryService)
        {
            _subCategoryService = subCategoryService;
        }

        [HttpGet("GetAllSubCategories")]
        public async Task<IActionResult> GetAllSubCategories()
        {
            var result = await _subCategoryService.GetAllSubCategoriesAsync();
            return Ok(result);
        }

        [HttpGet("GetSubCategoryById/{id}")]
        public async Task<IActionResult> GetSubCategoryById(int id)
        {
            var result = await _subCategoryService.GetSubCategoryByIdAsync(id);
            if (result == null)
                return NotFound(new { message = "Không tìm thấy SubCategory." });

            return Ok(result);
        }

        [HttpPost("CreateSubCategory")]
        public async Task<IActionResult> CreateSubCategory([FromBody] SubCategoryDto dto)
        {
            var created = await _subCategoryService.CreateSubCategoryAsync(dto);
            return CreatedAtAction(nameof(GetSubCategoryById), new { id = created.Id }, created);
        }

        [HttpPut("UpdateSubCategory/{id}")]
        public async Task<IActionResult> UpdateSubCategory(int id, [FromBody] SubCategoryDto dto)
        {
            var success = await _subCategoryService.UpdateSubCategoryAsync(id, dto);
            if (!success)
                return NotFound(new { message = "Không tìm thấy SubCategory để cập nhật." });

            return Ok(new { message = "Cập nhật SubCategory thành công." });
        }

        [HttpDelete("DeleteSubCategory/{id}")]
        public async Task<IActionResult> DeleteSubCategory(int id)
        {
            var success = await _subCategoryService.DeleteSubCategoryAsync(id);
            if (!success)
                return NotFound(new { message = "Không tìm thấy SubCategory để xóa." });

            return Ok(new { message = "Đã vô hiệu hóa SubCategory." });
        }
    }
}
