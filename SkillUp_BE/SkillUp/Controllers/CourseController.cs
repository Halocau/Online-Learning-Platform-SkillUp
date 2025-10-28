using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Course;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CourseController : ControllerBase
    {
        private readonly ICourseService _courseService;
        private readonly ICurrentUserService _currentUserService;
        public CourseController(ICourseService courseService, ICurrentUserService currentUserService)
        {
            _courseService = courseService;
            _currentUserService = currentUserService;
        }
        [HttpPost("Add-Course")]
        [Consumes("multipart/form-data")]
        [Authorize]
        public async Task<IActionResult> CreateDraftCourse([FromForm] CreateUpdateCourseDto request)
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

                if (!ModelState.IsValid)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Dữ liệu không hợp lệ",
                        data = new List<object> { ModelState }
                    });
                }

                try
                {                  
                    var result = await _courseService.CreateDraftCourseAsync(request, accountId.Value);

                    if (result == null)
                    {
                        return BadRequest(new APIReturn
                        {
                            code = 400,
                            message = "Không thể lưu khoá học.",
                            data = new List<object>()
                        });
                    }

                    return Ok(new APIReturn
                    {
                        code = 200,
                        message = "Tạo khoá học nháp thành công",
                        data = new List<object> { result }
                    });
                }
                catch (Exception serviceEx)
                {               
                    if (serviceEx.Message.Contains("Không tìm thấy giảng viên"))
                    {
                        return NotFound(new APIReturn
                        {
                            code = 404,
                            message = serviceEx.Message,
                            data = new List<object>()
                        });
                    }
                    throw;
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Có lỗi xảy ra: {ex.Message}",
                    data = new List<object>()
                });
            }
        }

        [HttpPut("Update-Course/{courseId}")]
        [Consumes("multipart/form-data")]
        [Authorize]
        public async Task<IActionResult> UpdateCourse(Guid courseId, [FromForm] CreateUpdateCourseDto request)
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

                var result = await _courseService.UpdateCourseAsync(request, courseId , accountId.Value);
                if (result == null)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Không thể cập nhật khoá học.",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Cập nhật khoá học thành công",
                    data = new List<object> { result }
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Có lỗi xảy ra: {ex.Message}",
                    data = new List<object>()
                });
            }
        }
        [HttpDelete("Delete-Course/{courseId}")]
        [Authorize]
        public async Task<IActionResult> DeleteCourse(Guid courseId)
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
                var result = await _courseService.DeleteCourseAsync(courseId, accountId.Value);

                if (!result)
                {                  
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Không thể gỡ khoá học.",
                        data = new List<object>()
                    });
                }          
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Gỡ khoá học thành công",
                    data = new List<object>()
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
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
