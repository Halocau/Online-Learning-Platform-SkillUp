using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.Bussiness.Services;
using SkillUp.BussinessObjects.Dtos.Section;
using SkillUp.ExceptionHandling;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SkillUp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SectionsController : ControllerBase
    {
        private readonly ISectionService _sectionService;

        public SectionsController(ISectionService sectionService)
        {
            _sectionService = sectionService;
        }

        // POST: api/Sections (Tạo mới)
        [HttpPost]
        // Đã sửa chính tả ở đây
        [Authorize(Roles = "Lecturer")]
        public async Task<IActionResult> CreateSection([FromBody] SectionCreateDto createDto)
        {
            try
            {
                var createdSection = await _sectionService.CreateSectionAsync(createDto);

                return StatusCode(201, new APIReturn(
                    201,
                    "Tạo section thành công",
                    new List<object> { createdSection }
                ));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn(
                    500,
                    $"Lỗi máy chủ: {ex.Message}",
                    new List<object>()
                ));
            }
        }

        // GET: api/Sections/{id} (Xem chi tiết 1 Section)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetSectionById(Guid id)
        {
            var section = await _sectionService.GetSectionByIdAsync(id);
            if (section == null)
            {
                return NotFound(new APIReturn(
                    404,
                    "Không tìm thấy section",
                    new List<object>()
                ));
            }

            return Ok(new APIReturn(
                200,
                "Lấy dữ liệu thành công",
                new List<object> { section }
            ));
        }

        // GET: api/Sections/ByCourse/{courseId} (Xem DS Sections của 1 Course)
        [HttpGet("ByCourse/{courseId}")]
        public async Task<IActionResult> GetSectionsByCourse(Guid courseId)
        {
            var sections = await _sectionService.GetSectionsByCourseIdAsync(courseId);

            return Ok(new APIReturn(
                200,
                "Lấy dữ liệu thành công",
                sections.Cast<object>().ToList()
            ));
        }

        // PUT: api/Sections/{id} (Cập nhật)
        [HttpPut("{id}")]
        // Đã sửa chính tả ở đây
        [Authorize(Roles = "Lecturer")]
        public async Task<IActionResult> UpdateSection(Guid id, [FromBody] SectionUpdateDto updateDto)
        {
            var updatedSection = await _sectionService.UpdateSectionAsync(id, updateDto);
            if (updatedSection == null)
            {
                return NotFound(new APIReturn(
                    404,
                    "Không tìm thấy section để cập nhật",
                    new List<object>()
                ));
            }

            return Ok(new APIReturn(
                200,
                "Cập nhật thành công",
                new List<object> { updatedSection }
            ));
        }

        // DELETE: api/Sections/{id} (Xóa - Soft Delete)
        [HttpDelete("{id}")]
        // Đã sửa chính tả ở đây
        [Authorize(Roles = "Lecturer")]
        public async Task<IActionResult> DeleteSection(Guid id)
        {
            var success = await _sectionService.DeleteSectionAsync(id);
            if (!success)
            {
                return NotFound(new APIReturn(
                    404,
                    "Không tìm thấy section để xóa",
                    new List<object>()
                ));
            }

            return Ok(new APIReturn(
                200,
                "Xóa section thành công",
                new List<object>()
            ));
        }
        [HttpPut("ManagerSection/{id}")]
        [Authorize(Roles = "Lecturer")]
        public async Task<IActionResult> RestoreSection(Guid id)
        {
            var restoredSection = await _sectionService.RestoreSectionAsync(id);
            if (restoredSection == null)
            {
                return NotFound(new APIReturn(
                    404,
                    "Không tìm thấy section để khôi phục",
                    new List<object>()
                ));
            }

            return Ok(new APIReturn(
                200,
                "Khôi phục section thành công",
                new List<object> { restoredSection }
            ));
        }
    }
}