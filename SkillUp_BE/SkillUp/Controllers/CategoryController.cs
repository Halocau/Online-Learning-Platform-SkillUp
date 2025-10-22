using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.Models;
//using SkillUp.Data; // namespace chứa DbContext của bạn
using SkillUp.BussinessObjects.DTOs.Category;

using System;

namespace SkillUp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly SkillUpContext _context;

        public CategoryController(SkillUpContext context)
        {
            _context = context;
        }

        // POST: api/Category/Create
        [HttpPost("Create")]
        public IActionResult CreateCategory([FromBody] CategoryRequestDto request)  
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                {
                    return BadRequest(new { message = "Tên danh mục không được để trống." });
                }

                var category = new Category
                {
                    Name = request.Name.Trim(),
                    IsActive = true // ✅ Luôn luôn true
                };

                _context.Categories.Add(category);
                _context.SaveChanges();

                return Ok(new
                {
                    message = "Tạo danh mục thành công.",
                    data = category
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Có lỗi xảy ra: {ex.Message}" });
            }
        }

        //Updatecategory
        [HttpPut("Update/{id}")]
        public IActionResult UpdateCategory(int id, [FromBody] CategoryRequestDto request)
        {
            try
            {
                var category = _context.Categories.FirstOrDefault(c => c.Id == id);
                if (category == null)
                    return NotFound(new { message = "Không tìm thấy danh mục." });

                if (string.IsNullOrWhiteSpace(request.Name))
                    return BadRequest(new { message = "Tên danh mục không được để trống." });

                // Cập nhật cả name và trạng thái
                category.Name = request.Name.Trim();
                category.IsActive = request.IsActive;

                _context.Categories.Update(category);
                _context.SaveChanges();

                return Ok(new
                {
                    message = "Cập nhật danh mục thành công.",
                    data = category
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Có lỗi xảy ra: {ex.Message}" });
            }
        }



        [HttpDelete("Delete/{id}")]
        public IActionResult DeleteCategory(int id)
        {
            try
            {
                // Tìm Category theo Id
                var category = _context.Categories.FirstOrDefault(c => c.Id == id);
                if (category == null)
                {
                    return NotFound(new { message = "Không tìm thấy danh mục." });
                }

                // Nếu đã bị vô hiệu hóa rồi thì thông báo
                if (!category.IsActive)
                {
                    return BadRequest(new { message = "Danh mục này đã bị vô hiệu hóa trước đó." });
                }

                // Thay đổi trạng thái IsActive -> false
                category.IsActive = false;

                _context.Categories.Update(category);
                _context.SaveChanges();

                return Ok(new
                {
                    message = "Xóa danh mục (soft delete) thành công.",
                    data = category
                });
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
                // Chỉ lấy các Category đang active
                var categories = _context.Categories
                    //.Where(c => c.IsActive)
                    .Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.IsActive
                    })
                    .ToList();

                return Ok(new
                {
                    message = "Lấy danh sách danh mục thành công.",
                    data = categories
                });
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
                var category = _context.Categories
                    //.Where(c => c.IsActive && c.Id == id)
                    .Where(c => c.Id == id)
                    .Select(c => new
                    {
                        c.Id,
                        c.Name,
                        c.IsActive
                    })
                    .FirstOrDefault();

                if (category == null)
                {
                    return NotFound(new { message = "Không tìm thấy danh mục hoặc danh mục đã bị vô hiệu hóa." });
                }

                return Ok(new
                {
                    message = "Lấy thông tin danh mục thành công.",
                    data = category
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Có lỗi xảy ra: {ex.Message}" });
            }
        }


    }
}
