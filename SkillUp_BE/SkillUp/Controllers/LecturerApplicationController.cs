using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Lecturer;
using SkillUp.BussinessObjects.DTOs.LecturerApplication;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Implementations;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class LecturerApplicationController : ControllerBase
    {
        private readonly ILecturerApplicationService _lecturerApplicationService;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILecturerService _lecturerService;

        public LecturerApplicationController(
            ILecturerApplicationService lecturerApplicationService,
            ICurrentUserService currentUserService,
            ILecturerService lecturerService)
        {
            _lecturerApplicationService = lecturerApplicationService;
            _currentUserService = currentUserService;
            _lecturerService = lecturerService;
        }

        [HttpGet("manage-lecturer-applications")]
        public async Task<IActionResult> GetAllLecturerApplicationsForModerator()
        {
            try
            {
                // Gọi service để lấy tất cả các đơn ứng tuyển
                var applications = await _lecturerApplicationService.GetAllLecturerApplicationsAsync();

                // Kiểm tra nếu không có dữ liệu
                if (applications == null || applications.Count == 0)
                {
                    return NotFound(new APIReturn
                    {
                        code = 404,
                        message = "Không có đơn ứng tuyển nào.",
                        data = new List<object>()
                    });
                }

                // Trả về danh sách các đơn ứng tuyển
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy danh sách ứng tuyển thành công",
                    data = new List<object> { applications }
                });
            }
            catch (Exception ex)
            {
                // Ghi lỗi chi tiết vào log hoặc console để tiện debug
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = ex.Message,
                    data = new List<object>()
                });
            }
        }


        [HttpPut("manage-lecturer-applications/update-status/{applicationId}")]
        public async Task<IActionResult> UpdateStatusForModerator(Guid applicationId, [FromBody] UpdateStatusRequestDto request)
        {
            try
            {
                var result = await _lecturerApplicationService.UpdateStatusAsync(applicationId, request);

                if (!result)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Không thể cập nhật trạng thái ứng tuyển! Kiểm tra quyền truy cập.",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Cập nhật trạng thái ứng tuyển và gửi email thành công!",
                    data = new List<object>()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = ex.Message,
                    data = new List<object>()
                });
            }
        }


        [HttpPost("apply")]
        public async Task<IActionResult> ApplyCv([FromForm] ApplyCvRequestDto request)
        {
            try
            {
                var userId = _currentUserService.UserId;
                if (userId == null)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Unauthorized",
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

                var result = await _lecturerApplicationService.ApplyCvAsync(userId.Value, request);

                if (!result)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Không thể nộp CV. Vui lòng thử lại!",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Nộp CV thành công!",
                    data = new List<object>()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = ex.Message,
                    data = new List<object>()
                });
            }
        }

     
        [HttpGet("my-applications")]
        public async Task<IActionResult> GetMyApplications()
        {
            try
            {
                var userId = _currentUserService.UserId;
                if (userId == null)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Unauthorized",
                        data = new List<object>()
                    });
                }

                var applications = await _lecturerApplicationService.GetMyApplicationsAsync(userId.Value);

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy danh sách CV thành công",
                    data = new List<object> { applications }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = ex.Message,
                    data = new List<object>()
                });
            }
        }

        [HttpPut("{applicationId}")]
        public async Task<IActionResult> UpdateApplication(Guid applicationId, [FromForm] UpdateCvRequestDto request)
        {
            try
            {
                var userId = _currentUserService.UserId;
                if (userId == null)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Unauthorized",
                        data = new List<object>()
                    });
                }

                var result = await _lecturerApplicationService.UpdateApplicationAsync(userId.Value, applicationId, request);

                if (!result)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Không thể cập nhật CV. CV đã được duyệt hoặc không tồn tại!",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Cập nhật CV thành công!",
                    data = new List<object>()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = ex.Message,
                    data = new List<object>()
                });
            }
        }


        [HttpGet("{applicationId}")]
        public async Task<IActionResult> GetApplicationById(Guid applicationId)
        {
            try
            {
                var application = await _lecturerApplicationService.GetApplicationByIdAsync(applicationId);

                // Kiểm tra nếu ứng tuyển không tồn tại
                if (application == null)
                {
                    return NotFound(new APIReturn
                    {
                        code = 404,
                        message = "Không tìm thấy CV",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy thông tin CV thành công",
                    data = new List<object> { application }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = ex.Message,
                    data = new List<object>()
                });
            }
        }

        [HttpGet("profile-by-account/{accountId}")]
        public async Task<IActionResult> GetLecturerByAccountId(Guid accountId)
        {
            try
            {
                var profile = await _lecturerService.GetProfileByAccountIdAsync(accountId);

                if (profile == null)
                {
                    return NotFound(new APIReturn
                    {
                        code = 404,
                        message = "Không tìm thấy thông tin giảng viên cho Account ID này (hoặc tài khoản này chưa là giảng viên).",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy thông tin giảng viên thành công",
                    data = new List<object> { profile }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = "Lỗi hệ thống: " + ex.Message,
                    data = new List<object>()
                });
            }
        }
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateLecturerProfileDto request)
        {
            try
            {
                // 1. Lấy User ID từ Token
                var userId = _currentUserService.UserId;
                if (userId == null)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Unauthorized - Bạn chưa đăng nhập",
                        data = new List<object>()
                    });
                }

                // 2. Validate dữ liệu đầu vào
                if (!ModelState.IsValid)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Dữ liệu không hợp lệ",
                        data = new List<object> { ModelState }
                    });
                }

                // 3. Gọi Service xử lý
                var result = await _lecturerService.UpdateLecturerProfileAsync(userId.Value, request);

                if (!result)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Cập nhật thất bại. Tài khoản này không phải là Giảng viên.",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Cập nhật hồ sơ giảng viên thành công!",
                    data = new List<object>()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = "Lỗi hệ thống: " + ex.Message,
                    data = new List<object>()
                });
            }
        }
    }
}