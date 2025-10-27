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

        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll([FromBody] SubCategoryCreateRequest request)
        {
            var result = await _service.CreateSubCategoryAsync(request);
            return Ok(result);
        }

        [HttpGet("GetByIdSubCategory/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetSubCategoryByIdAsync(id);
            if (result == null) return NotFound("Không tìm thấy SubCategory.");
            return Ok(result);
        }

        [HttpPost("CreateSubCategory")]
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

        [HttpPut("UpdateSubCategory/{id}")]
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

        [HttpDelete("DeleteSubCategory/{id}")]
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
