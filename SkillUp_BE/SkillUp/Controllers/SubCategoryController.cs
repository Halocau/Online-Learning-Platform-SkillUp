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

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _subCategoryService.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _subCategoryService.GetByIdAsync(id);
            if (result == null)
                return NotFound(new { message = "Không tìm thấy SubCategory." });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SubCategoryDto dto)
        {
            var created = await _subCategoryService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SubCategoryDto dto)
        {
            var success = await _subCategoryService.UpdateAsync(id, dto);
            if (!success) return NotFound(new { message = "Không tìm thấy SubCategory để cập nhật." });
            return Ok(new { message = "Cập nhật thành công." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _subCategoryService.DeleteAsync(id);
            if (!success) return NotFound(new { message = "Không tìm thấy SubCategory để xóa." });
            return Ok(new { message = "Đã vô hiệu hóa SubCategory." });
        }
    }
}
