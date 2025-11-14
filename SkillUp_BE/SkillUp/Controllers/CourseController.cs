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
        private readonly ILecturerService _lecturerService;

        public CourseController(ICourseService courseService, ICurrentUserService currentUserService, ILecturerService lecturerService)
        {
            _courseService = courseService;
            _currentUserService = currentUserService;
            _lecturerService = lecturerService;
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

                var result = await _courseService.UpdateCourseAsync(request, courseId, accountId.Value);
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
        [HttpPut("ban-unban-course/{courseId}")]
        [Authorize]
        public async Task<IActionResult> ToggleBanCourse(Guid courseId)
        {
            try
            {
                var adminAccountId = _currentUserService.UserId;
                if (!adminAccountId.HasValue)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ hoặc không tìm thấy người dùng",
                        data = new List<object>()
                    });
                }

                var newIsActiveStatus = await _courseService.ToggleBanCourseAsync(courseId, adminAccountId.Value);

                var message = newIsActiveStatus ?
                    "Đã bỏ cấm (Unban) khóa học thành công." :
                    "Đã cấm (Ban) khóa học thành công.";

                return Ok(new APIReturn
                {
                    code = 200,
                    message = message,
                    data = new List<object> { new { isActive = newIsActiveStatus } }
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
        [HttpGet("GetListCourseByCategory/{CategoryId}")]
        public async Task<IActionResult> GetListCourseByCategoryId(int CategoryId)
        {
            try
            {
                var result = await _courseService.GetListCourseByCateId(CategoryId);


                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy danh sách khóa học thành công",
                    data = new List<object> { result }
                });
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
        [HttpGet("GetListCourseBySubCategory/{subCategoryId}")]
        public async Task<IActionResult> GetListCourseBySubCategoryId(int subCategoryId)
        {
            try
            {
                var result = await _courseService.GetListCourseBySubCateId(subCategoryId);


                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy danh sách khóa học thành công",
                    data = new List<object> { result }
                });
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

        [HttpGet("All-Courses")]
        public async Task<IActionResult> GetAllCourses()
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
                var courses = await _courseService.GetAllCourseAsync(accountId.Value);
                if (courses == null || courses.Count == 0)
                {
                    return NotFound(new APIReturn
                    {
                        code = 404,
                        message = "Không tìm thấy khóa học nào.",
                        data = new List<object>()
                    });
                }
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Danh sách khóa học",
                    data = courses.Cast<object>().ToList()
                });
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
        [HttpGet("Courses-Of-Lecturer")]
        public async Task<IActionResult> GetCoursesOfLecturer()
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
                var courses = await _courseService.GetCoursesOfLecturerByAccountId(accountId.Value);
                if (courses == null || courses.Count == 0)
                {
                    return NotFound(new APIReturn
                    {
                        code = 404,
                        message = "Không tìm thấy khóa học nào.",
                        data = new List<object>()
                    });
                }
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Danh sách khóa học",
                    data = courses.Cast<object>().ToList()
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

        [HttpGet("{courseId}")]
        public async Task<IActionResult> GetCourseDetails(Guid courseId)
        {
            try
            {
                var courseDetails = await _courseService.GetCourseDetailsAsync(courseId);

                if (courseDetails == null)
                {
                    return NotFound(new APIReturn
                    {
                        code = 404,
                        message = "Khóa học không tồn tại",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy chi tiết khóa học thành công",
                    data = new List<object> { courseDetails }
                });
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

        [HttpPut("Set-Price/{courseId}")]
        [Authorize]
        public async Task<IActionResult> SetCoursePrice(Guid courseId, [FromBody] CoursePriceDto request)
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

                var result = await _courseService.SetCoursePriceAsync(courseId, request, accountId.Value);

                if (!result)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Không thể lưu giá khoá học.",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Đặt giá khoá học thành công",
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
        [HttpPut("Publish-Course/{courseId}")]
        [Authorize]
        public async Task<IActionResult> PublishCourse(Guid courseId)
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

                var result = await _courseService.PublishCourseForReviewAsync(courseId, accountId.Value);

                if (!result)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Không thể xuất bản khoá học do lỗi không xác định.",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Xuất bản khoá học thành công!",
                    data = new List<object>()
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Vui lòng") || ex.Message.Contains("Khóa học phải có") || ex.Message.Contains("đã được xuất bản"))
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = ex.Message,
                        data = new List<object>()
                    });
                }

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

        [HttpPut("Approve-Course/{courseId}")]
        [Authorize]
        public async Task<IActionResult> ApproveCourse(Guid courseId, [FromQuery] bool decision)
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
                var result = await _courseService.PublishCourseForModerator(courseId, accountId.Value, decision);
                if (!result)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Không thể phê duyệt khoá học do lỗi không xác định.",
                        data = new List<object>()
                    });
                }
                var message = decision ? "Khoá học đã được phê duyệt thành công!" : "Khoá học đã bị từ chối!";
                return Ok(new APIReturn
                {
                    code = 200,
                    message = message,
                    data = new List<object>()
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid("Bạn không có quyền này!");
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
