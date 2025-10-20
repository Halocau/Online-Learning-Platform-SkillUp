using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.BussinessObjects.Dtos;
using System.Linq;
using System.Threading.Tasks;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SubCategoryController : ControllerBase
    {
        private readonly SkillUpContext _context;

        public SubCategoryController(SkillUpContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllSubCategories()
        {
            try
            {
                var subCategories = await _context.SubCategories
                    .Include(sc => sc.Category)
                    .Select(sc => new
                    {
                        sc.Id,
                        sc.Name,
                        sc.CategoryId,
                        CategoryName = sc.Category != null ? sc.Category.Name : null,
                        sc.IsActive
                    })
                    .ToListAsync();

                return Ok(subCategories);
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Lỗi khi lấy danh sách SubCategory",
                    error = ex.Message
                });
            }
        }

       
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSubCategoryById(int id)
        {
            var subCategory = await _context.SubCategories
                .Include(sc => sc.Category)
                .Where(sc => sc.Id == id)
                .Select(sc => new
                {
                    sc.Id,
                    sc.Name,
                    sc.CategoryId,
                    CategoryName = sc.Category != null ? sc.Category.Name : null,
                    sc.IsActive
                })
                .FirstOrDefaultAsync();

            if (subCategory == null)
                return NotFound();

            return Ok(subCategory);
        }

     
        [HttpPost]
        public async Task<IActionResult> CreateSubCategory([FromBody] SubCategoryDto subCategoryDto)
        {
            if (subCategoryDto == null)
                return BadRequest("Dữ liệu không được để trống.");

            var categoryExists = await _context.Categories.AnyAsync(c => c.Id == subCategoryDto.CategoryId);
            if (!categoryExists)
                return BadRequest("CategoryId không hợp lệ.");

            var newSubCategory = new SubCategory
            {
                Name = subCategoryDto.Name,
                CategoryId = subCategoryDto.CategoryId,
                IsActive = true
            };

            _context.SubCategories.Add(newSubCategory);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSubCategoryById), new { id = newSubCategory.Id }, newSubCategory);
        }

        // ✅ Cập nhật
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubCategory(int id, [FromBody] SubCategoryDto subCategoryDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existingSubCategory = await _context.SubCategories.FindAsync(id);
            if (existingSubCategory == null)
                return NotFound();

            existingSubCategory.Name = subCategoryDto.Name;
            existingSubCategory.CategoryId = subCategoryDto.CategoryId;
            existingSubCategory.IsActive = subCategoryDto.IsActive;

            _context.Entry(existingSubCategory).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.SubCategories.Any(e => e.Id == id))
                    return NotFound();
                else
                    throw;
            }

            return NoContent();
        }

        // ✅ Xóa mềm: chỉ chuyển IsActive = false
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubCategory(int id)
        {
            var subCategory = await _context.SubCategories.FindAsync(id);
            if (subCategory == null)
                return NotFound();

            if (!subCategory.IsActive)
                return BadRequest("SubCategory này đã bị vô hiệu hóa trước đó.");

            subCategory.IsActive = false;

            _context.Entry(subCategory).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã vô hiệu hóa SubCategory thành công." });
        }
    }
}
