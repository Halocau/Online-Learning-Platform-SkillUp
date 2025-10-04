using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Auth;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Dữ liệu không hợp lệ",
                        data = new List<object> { ModelState }
                    });
                }

                // call service login
                var result = await _authService.LoginAsync(request);

                // fail login
                if (result == null)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Email hoặc mật khẩu không đúng",
                        data = new List<object>()
                    });
                }

                // Login success
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Đăng nhập thành công",
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

     
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Dữ liệu không hợp lệ",
                        data = new List<object> { ModelState }
                    });
                }

                // call service  refresh token
                var result = await _authService.RefreshTokenAsync(request);

                // refresh token fail
                if (result == null)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ hoặc đã hết hạn",
                        data = new List<object>()
                    });
                }

                // Refresh succcess
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Làm mới token thành công",
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

       
        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] Guid userId)
        {
            try
            {
                // call service logout
                var result = await _authService.LogoutAsync(userId);

                // fail logout
                if (!result)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Đăng xuất thất bại",
                        data = new List<object>()
                    });
                }

                // Logout success
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Đăng xuất thành công",
                    data = new List<object>()
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
    }
}
