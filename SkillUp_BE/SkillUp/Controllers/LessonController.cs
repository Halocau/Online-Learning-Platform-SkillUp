using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IO;
using System.Linq;
using SkillUp.BussinessObjects.DTOs.Lesson;
using SkillUp.Services.Interfaces;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Common;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LessonController : ControllerBase
    {
        private readonly ILessonService _lessonService;
        private readonly ICurrentUserService _currentUserService;

        public LessonController(
            ILessonService lessonService, 
            ICurrentUserService currentUserService)
        {
            _lessonService = lessonService;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllLessons()
        {
            try
            {
                var lessons = await _lessonService.GetAllLessonsAsync();
                return Ok(new APIReturn(200, "Lấy danh sách bài học thành công", new List<object> { lessons }));
            }
            catch (Exception ex)
            {
                return BadRequest(new APIReturn(400, ex.Message, new List<object>()));
            }
        }

        [HttpGet("active")]
        public async Task<IActionResult> GetActiveLessons()
        {
            try
            {
                var lessons = await _lessonService.GetActiveLessonsAsync();
                return Ok(new APIReturn(200, "Lấy danh sách bài học đang hoạt động thành công", new List<object> { lessons }));
            }
            catch (Exception ex)
            {
                return BadRequest(new APIReturn(400, ex.Message, new List<object>()));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetLessonById(Guid id)
        {
            try
            {
                var lesson = await _lessonService.GetLessonByIdAsync(id);
                if (lesson == null)
                {
                    return NotFound(new APIReturn(404, "Không tìm thấy bài học", new List<object>()));
                }

                return Ok(new APIReturn(200, "Lấy thông tin bài học thành công", new List<object> { lesson }));
            }
            catch (Exception ex)
            {
                return BadRequest(new APIReturn(400, ex.Message, new List<object>()));
            }
        }


        [HttpGet("section/{sectionId}")]
        public async Task<IActionResult> GetLessonsBySection(Guid sectionId)
        {
            try
            {
                var lessons = await _lessonService.GetLessonsBySectionIdAsync(sectionId);
                return Ok(new APIReturn(200, "Lấy danh sách bài học theo section thành công", new List<object> { lessons }));
            }
            catch (Exception ex)
            {
                return BadRequest(new APIReturn(400, ex.Message, new List<object>()));
            }
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        [Authorize]
        public async Task<IActionResult> CreateLesson([FromForm] CreateLessonDto dto)
        {
            try
            {
                // Validate ModelState
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList();
                    return BadRequest(new APIReturn(400, "Dữ liệu không hợp lệ", errors.Cast<object>().ToList()));
                }

                var accountId = _currentUserService.UserId ?? Guid.Empty;
                var lesson = await _lessonService.CreateLessonAsync(dto, accountId);
                return Ok(new APIReturn(200, "Tạo bài học thành công", new List<object> { lesson }));
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new APIReturn(400, ex.Message, new List<object>()));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new APIReturn(400, ex.Message, new List<object>()));
            }
        }


        [HttpPut("{id}")]
        [Consumes("multipart/form-data")]
        [Authorize]
        public async Task<IActionResult> UpdateLesson(Guid id, [FromForm] UpdateLessonDto dto)
        {
            try
            {
                var accountId = _currentUserService.UserId ?? Guid.Empty;
                var lesson = await _lessonService.UpdateLessonAsync(id, dto, accountId);
                return Ok(new APIReturn(200, "Cập nhật bài học thành công", new List<object> { lesson }));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new APIReturn(400, ex.Message, new List<object>()));
            }
        }


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
                    return NotFound(new APIReturn(404, "Không thể xóa bài học", new List<object>()));
                }

                return Ok(new APIReturn(200, "Xóa bài học thành công", new List<object> { result }));
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest(new APIReturn(400, ex.Message, new List<object>()));
            }
        }

        [HttpPost("{lessonId}/complete")]
        [Authorize]
        public async Task<IActionResult> MarkLessonComplete(Guid lessonId)
        {
            try
            {
                var accountId = _currentUserService.UserId;
                if (!accountId.HasValue)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ hoặc không tìm thấy người dùng",
                        data = new List<object>()
                    });
                }
                var isCompleted = await _lessonService.MarkLessonAsCompletedAsync(lessonId, accountId.Value);
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Đã đánh dấu hoàn thành bài học",
                    data = new List<object> { new { isCompleted = true } }
                });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Không tìm thấy"))
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

