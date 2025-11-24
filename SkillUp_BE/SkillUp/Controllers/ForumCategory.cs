using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Category;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ForumCategoryController : ControllerBase
    {
        private readonly IForumCategoryService _forumCategoryService;

        public ForumCategoryController(IForumCategoryService forumCategoryService)
        {
            _forumCategoryService = forumCategoryService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateForumCategory([FromBody] ForumCategoryDto dto)
        {
            var result = await _forumCategoryService.CreateAsync(dto);
            return StatusCode(result.Code, result);
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateForumCategory(int id, [FromBody] ForumCategoryDto dto)
        {
            var result = await _forumCategoryService.UpdateAsync(id, dto);
            return StatusCode(result.Code, result);
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteForumCategory(int id)
        {
            var result = await _forumCategoryService.DeleteAsync(id);
            return StatusCode(result.Code, result);
        }

        [HttpGet("get-all")]
        public async Task<IActionResult> GetAllForumCategories()
        {
            var result = await _forumCategoryService.GetAllAsync();
            return StatusCode(result.Code, result);
        }

        [HttpGet("get-by-id/{id}")]
        public async Task<IActionResult> GetForumCategoryById(int id)
        {
            var result = await _forumCategoryService.GetByIdAsync(id);
            return StatusCode(result.Code, result);
		}
	}
}
