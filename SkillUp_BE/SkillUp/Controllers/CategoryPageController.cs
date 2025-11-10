using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryPageController : ControllerBase
    {
        private readonly ICourseService _courseService;

        public CategoryPageController(ICourseService courseService)
        {
            _courseService = courseService;
        }
        [HttpGet("{id}/page")]
        public async Task<IActionResult> GetCategoryPage(int id)
        {
            try
            {
                var pageData = await _courseService.GetCategoryPageAsync(id);

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy dữ liệu trang danh mục thành công",
                    data = new List<object> { pageData }
                });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Không tìm thấy danh mục"))
                {
                    return NotFound(new APIReturn
                    {
                        code = 404,
                        message = ex.Message,
                        data = new List<object>()
                    });
                }
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Có lỗi xảy ra: {ex.Message}",
                    data = new List<object>()
                });
            }
        }
    }
}
