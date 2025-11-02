using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Lesson;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LessonController : ControllerBase
    {
        private readonly ILessonService _lessonService;
        private readonly ICurrentUserService _currentUserService;

        public LessonController(ILessonService lessonService, ICurrentUserService currentUserService)
        {
            _lessonService = lessonService;
            _currentUserService = currentUserService;
        }

        /// <summary>
        /// Lấy tất cả bài học
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAllLessons()
        {
            try
            {
                var lessons = await _lessonService.GetAllLessonsAsync();
                return Ok(new
                {
                    code = 200,
                    message = "Lấy danh sách bài học thành công",
                    data = lessons
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy các bài học đang active
        /// </summary>
        [HttpGet("active")]
        public async Task<IActionResult> GetActiveLessons()
        {
            try
            {
                var lessons = await _lessonService.GetActiveLessonsAsync();
                return Ok(new
                {
                    code = 200,
                    message = "Lấy danh sách bài học đang hoạt động thành công",
                    data = lessons
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy bài học theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetLessonById(Guid id)
        {
            try
            {
                var lesson = await _lessonService.GetLessonByIdAsync(id);
                if (lesson == null)
                {
                    return NotFound(new { code = 404, message = "Không tìm thấy bài học" });
                }

                return Ok(new
                {
                    code = 200,
                    message = "Lấy thông tin bài học thành công",
                    data = lesson
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }

        /// <summary>
        /// Lấy tất cả bài học theo Section ID
        /// </summary>
        [HttpGet("section/{sectionId}")]
        public async Task<IActionResult> GetLessonsBySection(Guid sectionId)
        {
            try
            {
                var lessons = await _lessonService.GetLessonsBySectionIdAsync(sectionId);
                return Ok(new
                {
                    code = 200,
                    message = "Lấy danh sách bài học theo section thành công",
                    data = lessons
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }

        /// <summary>
        /// Tạo bài học mới (Giảng viên)
        /// </summary>
        [HttpPost]
        [Consumes("multipart/form-data")]
        [Authorize]
        public async Task<IActionResult> CreateLesson([FromForm] CreateLessonDto dto)
        {
            try
            {
                var accountId = _currentUserService.UserId ?? Guid.Empty;
                var lesson = await _lessonService.CreateLessonAsync(dto, accountId);
                return Ok(new
                {
                    code = 200,
                    message = "Tạo bài học thành công",
                    data = lesson
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }

        /// <summary>
        /// Cập nhật bài học (Giảng viên)
        /// </summary>
        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        [Authorize]
        public async Task<IActionResult> UpdateLesson(Guid id, [FromForm] UpdateLessonDto dto)
        {
            try
            {
                var accountId = _currentUserService.UserId ?? Guid.Empty;
                var lesson = await _lessonService.UpdateLessonAsync(id, dto, accountId);
                return Ok(new
                {
                    code = 200,
                    message = "Cập nhật bài học thành công",
                    data = lesson
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }

        /// <summary>
        /// Xóa bài học (Soft delete - Giảng viên)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteLesson(Guid id)
        {
            try
            {
                var accountId = _currentUserService.UserId ?? Guid.Empty;
                var result = await _lessonService.DeleteLessonAsync(id, accountId);

                if (!result)
                {
                    return NotFound(new { code = 404, message = "Không thể xóa bài học" });
                }

                return Ok(new
                {
                    code = 200,
                    message = "Xóa bài học thành công",
                    data = result
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new { code = 400, message = ex.Message });
            }
        }
    }
}

