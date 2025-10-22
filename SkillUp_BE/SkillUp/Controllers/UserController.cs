using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.User;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserService _userService;

        public UserController(ICurrentUserService currentUserService, IUserService userService)
        {
            _currentUserService = currentUserService;
            _userService = userService;
        }

        [HttpGet("View-Profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            try
            {
                var userId = _currentUserService.UserId;
                if (!userId.HasValue)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ hoặc không tìm thấy ID người dùng"
                    });
                }
                var rs = await _userService.GetMyProfileAsync(userId.Value);

                if (rs == null)
                {
                    return NotFound(new APIReturn
                    {
                        code = 404,
                        message = "Không tìm thấy hồ sơ người dùng"
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy thông tin hồ sơ thành công",
                    data = new List<object> { rs }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Lỗi máy chủ nội bộ: {ex.Message}"
                });
            }
        }

        [HttpPut("Edit-profile")]
        public async Task<IActionResult> EditProfile([FromBody] UpdateProfileDTO updateProfileDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = "Dữ liệu không hợp lệ"
                });
            }
            try
            {
                var userId = _currentUserService.UserId;

                if (!userId.HasValue)

                {

                    return Unauthorized(new APIReturn { code = 401, message = "Token không hợp lệ" });

                }
                var result = await _userService.UpdateProfileAsync(userId.Value, updateProfileDTO);
                if (!result)

                {

                    return BadRequest(new APIReturn { code = 400, message = "Cập nhật thất bại" });

                }
                return Ok(new APIReturn { code = 200, message = "Cập nhật hồ sơ thành công" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Lỗi máy chủ nội bộ: {ex.Message}"
                });
            }
        }
    }
}
