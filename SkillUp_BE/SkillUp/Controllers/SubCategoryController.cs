using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs;
using SkillUp.Services.Interfaces;

namespace SkillUp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubCategoryController : ControllerBase
    {
        private readonly ISubCategoryService _service;

        public SubCategoryController(ISubCategoryService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllSubCategoriesAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetSubCategoryByIdAsync(id);
            if (result == null) return NotFound("Không tìm thấy SubCategory.");
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SubCategoryCreateRequest request)
        {
            try
            {
                var result = await _service.CreateSubCategoryAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SubCategoryUpdateRequest request)
        {
            try
            {
                await _service.UpdateSubCategoryAsync(id, request);
                return Ok("Cập nhật thành công.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.DeleteSubCategoryAsync(id);
                return Ok("Xóa thành công.");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
