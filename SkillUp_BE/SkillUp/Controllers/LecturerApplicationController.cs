using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.LecturerApplication;
using SkillUp.ExceptionHandling;
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

        public LecturerApplicationController(
            ILecturerApplicationService lecturerApplicationService,
            ICurrentUserService currentUserService)
        {
            _lecturerApplicationService = lecturerApplicationService;
            _currentUserService = currentUserService;
        }

        /// <summary>
        /// Apply CV for lecturer position (first time or reapply)
        /// </summary>
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

        /// <summary>
        /// Get all my applications
        /// </summary>
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

        /// <summary>
        /// Update application by ID
        /// </summary>
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

        /// <summary>
        /// Get application by ID
        /// </summary>
        [HttpGet("{applicationId}")]
        public async Task<IActionResult> GetApplicationById(Guid applicationId)
        {
            try
            {
                var application = await _lecturerApplicationService.GetApplicationByIdAsync(applicationId);

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
    }
}
