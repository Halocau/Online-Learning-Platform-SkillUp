using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.BussinessObjects.Dtos;
using System.Threading.Tasks;
using SkillUp.BussinessObjects.DTOs.Category;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ForumCategoryController : ControllerBase
    {
        private readonly SkillUpContext _context;

        public ForumCategoryController(SkillUpContext context)
        {
            _context = context;
        }

        // POST: api/ForumCategory/create
        [HttpPost("create")]
        public async Task<IActionResult> CreateForumCategory([FromBody] ForumCategoryDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
                {
                    return BadRequest(new
                    {
                        code = 400,
                        message = "Tên danh mục không được để trống."
                    });
                }

                // Kiểm tra trùng tên
                bool exists = await _context.ForumCategories
                    .AnyAsync(c => c.Name.ToLower() == dto.Name.ToLower());
                if (exists)
                {
                    return Conflict(new
                    {
                        code = 409,
                        message = "Danh mục đã tồn tại."
                    });
                }

                // Tạo mới entity (bỏ qua Id từ body)
                var forumCategory = new ForumCategory
                {
                    Name = dto.Name,
                    IsActive = dto.IsActive
                };

                _context.ForumCategories.Add(forumCategory);
                await _context.SaveChangesAsync();

                // Gán lại Id được sinh tự động
                dto.Id = forumCategory.Id;

                return Ok(new
                {
                    code = 200,
                    message = "Tạo danh mục diễn đàn thành công.",
                    data = dto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    code = 500,
                    message = $"Đã xảy ra lỗi: {ex.Message}"
                });
            }
        }

        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateForumCategory(int id, [FromBody] ForumCategoryDto dto)
        {
            try
            {
                if (dto == null || string.IsNullOrWhiteSpace(dto.Name))
                {
                    return BadRequest(new
                    {
                        code = 400,
                        message = "Tên danh mục không được để trống."
                    });
                }

                var existingCategory = await _context.ForumCategories.FindAsync(id);
                if (existingCategory == null)
                {
                    return NotFound(new
                    {
                        code = 404,
                        message = "Không tìm thấy danh mục diễn đàn."
                    });
                }

                // Kiểm tra trùng tên (ngoại trừ chính nó)
                bool nameExists = await _context.ForumCategories
                    .AnyAsync(c => c.Id != id && c.Name.ToLower() == dto.Name.ToLower());
                if (nameExists)
                {
                    return Conflict(new
                    {
                        code = 409,
                        message = "Tên danh mục đã tồn tại."
                    });
                }

                // Cập nhật dữ liệu
                existingCategory.Name = dto.Name;
                existingCategory.IsActive = dto.IsActive;

                _context.ForumCategories.Update(existingCategory);
                await _context.SaveChangesAsync();

                dto.Id = existingCategory.Id;

                return Ok(new
                {
                    code = 200,
                    message = "Cập nhật danh mục diễn đàn thành công.",
                    data = dto
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    code = 500,
                    message = $"Đã xảy ra lỗi: {ex.Message}"
                });
            }
        }
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteForumCategory(int id)
        {
            try
            {
                var category = await _context.ForumCategories.FindAsync(id);
                if (category == null)
                {
                    return NotFound(new
                    {
                        code = 404,
                        message = "Không tìm thấy danh mục diễn đàn."
                    });
                }

                // Nếu đã bị vô hiệu hóa rồi thì không cần xóa nữa
                if (!category.IsActive)
                {
                    return BadRequest(new
                    {
                        code = 400,
                        message = "Danh mục này đã bị vô hiệu hóa trước đó."
                    });
                }

                // Soft delete
                category.IsActive = false;
                _context.ForumCategories.Update(category);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    code = 200,
                    message = "Xóa danh mục (vô hiệu hóa) thành công.",
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
                return StatusCode(500, new
                {
                    code = 500,
                    message = $"Đã xảy ra lỗi: {ex.Message}"
                });
            }
        }
        [HttpGet("get-all")]
        public async Task<IActionResult> GetAllForumCategories()
        {
            try
            {
                var categories = await _context.ForumCategories
                    .Select(c => new ForumCategoryDto
                    {
                        Id = c.Id,
                        Name = c.Name,
                        IsActive = c.IsActive
                    })
                    .ToListAsync();

                if (categories == null || categories.Count == 0)
                {
                    return Ok(new
                    {
                        code = 200,
                        message = "Không có danh mục nào.",
                        data = new List<ForumCategoryDto>()
                    });
                }

                return Ok(new
                {
                    code = 200,
                    message = "Lấy danh sách danh mục thành công.",
                    data = categories
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    code = 500,
                    message = $"Đã xảy ra lỗi: {ex.Message}"
                });
            }
        }
    }
}
