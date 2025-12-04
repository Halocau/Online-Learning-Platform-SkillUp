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
        public async Task<IActionResult> UpdateCourse(Guid courseId, [FromForm] UpdateCourseDto request)
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

                // (Nên thêm check ModelState để trả về lỗi Validation đúng format)
                if (!ModelState.IsValid)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Dữ liệu không hợp lệ",
                        data = new List<object> { ModelState }
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
                return StatusCode(403, new APIReturn
                {
                    code = 403,
                    message = ex.Message,
                    data = new List<object>()
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
                return StatusCode(403, new APIReturn
                {
                    code = 403,
                    message = ex.Message,
                    data = new List<object>()
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

        [HttpPut("Open-Course/{courseId}")]
        [Authorize]
        public async Task<IActionResult> OpenCourse(Guid courseId)
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
                var result = await _courseService.PublishCourseAsync(courseId, accountId.Value);

                if (!result)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Không thể mở khoá học.",
                        data = new List<object>()
                    });
                }
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Mở lại khoá học thành công",
                    data = new List<object>()
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new APIReturn
                {
                    code = 403,
                    message = ex.Message,
                    data = new List<object>()
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
                return StatusCode(403, new APIReturn
                {
                    code = 403,
                    message = ex.Message,
                    data = new List<object>()
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

        [HttpGet("{courseId}/learning")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetCourseLearningContent(Guid courseId)
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

                var courseDetails = await _courseService.GetCourseLearningContentAsync(courseId, accountId.Value);

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy chi tiết học tập của khóa học thành công",
                    data = new List<object> { courseDetails }
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new APIReturn
                {
                    code = 403,
                    message = ex.Message,
                    data = new List<object>()
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
                return StatusCode(403, new APIReturn
                {
                    code = 403,
                    message = ex.Message,
                    data = new List<object>()
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
                return StatusCode(403, new APIReturn
                {
                    code = 403,
                    message = ex.Message,
                    data = new List<object>()
                });
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
        public async Task<IActionResult> ApproveCourse(Guid courseId, [FromQuery] bool decision, [FromQuery] string reason)
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
                var result = await _courseService.PublishCourseForModerator(courseId, accountId.Value, decision, reason);
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

        [HttpGet("student-enrolled-courses")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetEnrolledCourses()
        {
            try
            {
                var accountId = _currentUserService.UserId;
                if (!accountId.HasValue)
                {
                    return Ok(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ hoặc không tìm thấy người dùng",
                        data = new List<object>()
                    });
                }

                var enrolledCourses = await _courseService.GetEnrolledCoursesByAccountIdAsync(accountId.Value);

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy danh sách khóa học đã đăng ký thành công",
                    data = new List<object> { enrolledCourses }
                });
            }
            catch (Exception ex)
            {
                return Ok(new APIReturn
                {
                    code = 500,
                    message = $"Có lỗi xảy ra: {ex.Message}",
                    data = new List<object>()
                });
            }
        }

        [HttpGet("search")]
        [AllowAnonymous]
        public async Task<IActionResult> SearchCourses([FromQuery] string keyword, [FromQuery] int limit = 10)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = "Từ khóa tìm kiếm không được để trống",
                    data = new List<object>()
                });
            }

            try
            {
                var safeLimit = Math.Clamp(limit, 1, 50);
                var results = await _courseService.SearchCoursesAsync(keyword, safeLimit);

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Tìm kiếm khóa học thành công",
                    data = results.Cast<object>().ToList()
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
        [HttpGet("my-courses")]
        [Authorize] 
        public async Task<IActionResult> GetMyCourses()
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

                var myCourses = await _courseService.GetMyCoursesAsync(accountId.Value);

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy danh sách khóa học của tôi thành công",
                    data = new List<object> { myCourses }
                });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Không tìm thấy sinh viên"))
                {
                    return NotFound(new APIReturn { code = 404, message = ex.Message, data = new List<object>() });
                }

                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Có lỗi xảy ra: {ex.Message}",
                    data = new List<object>()
                });
            }
        }
        [HttpGet("{courseId}/resume")]
        [Authorize]
        public async Task<IActionResult> GetResumeItem(Guid courseId)
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
                var resumeData = await _courseService.GetResumeItemAsync(courseId, accountId.Value);
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy vị trí học tiếp thành công",
                    data = new List<object> { resumeData }
                });
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Không tìm thấy") || ex.Message.Contains("chưa có nội dung"))
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
