using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Category;
using SkillUp.Services.Interfaces;
using System;
using System.Linq;

namespace SkillUp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _service;

        public CategoryController(ICategoryService service)
        {
            _service = service;
        }

        [HttpPost("Create")]
        public IActionResult CreateCategory([FromBody] CategoryRequestDto request)
        {
            try
            {
                var category = _service.Create(request);
                return Ok(new { message = "Tạo danh mục thành công.", data = category });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("Update/{id}")]
        public IActionResult UpdateCategory(int id, [FromBody] CategoryRequestDto request)
        {
            try
            {
                var category = _service.Update(id, request);
                return Ok(new { message = "Cập nhật danh mục thành công.", data = category });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("Delete/{id}")]
        public IActionResult DeleteCategory(int id)
        {
            try
            {
                var category = _service.Delete(id);
                return Ok(new { message = "Xóa danh mục (soft delete) thành công.", data = category });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpGet("Get-Only-Category")]
        public IActionResult GetAllOnlyCategories()
        {
            try
            {
                var categories = _service.GetAllWithSubCategories()
             .Select(c => new
              {
                  c.Id,
                  c.Name,
                  c.IsActive,
                
              });

                return Ok(new { message = "Lấy danh sách danh mục (kèm danh mục con) thành công.", data = categories });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Có lỗi xảy ra: {ex.Message}" });
            }
        }

        [HttpGet("GetAll")]
        public IActionResult GetAllCategories()
        {
            try
            {
                var categories = _service.GetAllWithSubCategories()
                    .Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.IsActive,
                        SubCategories = c.SubCategories
                            .Where(sc => sc.IsActive)
                            .Select(sc => new
                            {
                                sc.Id,
                                sc.Name,
                                sc.IsActive
                            })
                            .ToList()
                    });

                return Ok(new { message = "Lấy danh sách danh mục (kèm danh mục con) thành công.", data = categories });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Có lỗi xảy ra: {ex.Message}" });
            }
        }

      
        [HttpGet("GetById/{id}")]
        public IActionResult GetCategoryById(int id)
        {
            try
            {
                var category = _service.GetById(id);
                if (category == null)
                    return NotFound(new { message = "Không tìm thấy danh mục." });

                return Ok(new
                {
                    message = "Lấy thông tin danh mục thành công.",
                    data = new
                    {
                        category.Id,
                        category.Name,
                        category.IsActive
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Có lỗi xảy ra: {ex.Message}" });
            }
        }

        [HttpGet("GetWithSub/{id}")]
        public IActionResult GetCategoryWithSubCategories(int id)
        {
            try
            {
                var category = _service.GetByIdWithSubCategories(id);
                if (category == null)
                    return NotFound(new { message = "Không tìm thấy danh mục." });

                var result = new
                {
                    category.Id,
                    category.Name,
                    category.IsActive,
                    SubCategories = category.SubCategories
                        .Where(sc => sc.IsActive)
                        .Select(sc => new
                        {
                            sc.Id,
                            sc.Name,
                            sc.IsActive
                        })
                        .ToList()
                };

                return Ok(new
                {
                    message = "Lấy danh mục và các danh mục con thành công.",
                    data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Có lỗi xảy ra: {ex.Message}" });
            }
        }
    }
}
