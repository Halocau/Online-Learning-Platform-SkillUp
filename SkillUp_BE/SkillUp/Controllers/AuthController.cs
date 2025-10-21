using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Auth;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IConfiguration _configuration;
        private readonly IAccountRepository _accountRepository;

        public AuthController(
            IAuthService authService, 
            ICurrentUserService currentUserService, 
            IConfiguration configuration,
            IAccountRepository accountRepository)
        {
            _authService = authService;
            _currentUserService = currentUserService;
            _configuration = configuration;
            _accountRepository = accountRepository;
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

                try
                {
                    var result = await _authService.LoginAsync(request);

                    if (result == null)
                    {
                        return Unauthorized(new APIReturn
                        {
                            code = 401,
                            message = "Email hoặc mật khẩu không đúng",
                            data = new List<object>()
                        });
                    }

                    return Ok(new APIReturn
                    {
                        code = 200,
                        message = "Đăng nhập thành công",
                        data = new List<object> { result }
                    });
                }
                catch (Exception)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Tài khoản chưa được kích hoạt",
                        data = new List<object>()
                    });
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
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            try
            {
                var userId = _currentUserService.UserId;
                if (!userId.HasValue)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ",
                        data = new List<object>()
                    });
                }

                var result = await _authService.LogoutAsync(userId.Value);

                if (!result)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Đăng xuất thất bại",
                        data = new List<object>()
                    });
                }

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

        /// <summary>
        /// Test endpoint để kiểm tra JWT token có còn hợp lệ không
        /// </summary>
        [HttpGet("test-token")]
        [Authorize]
        public IActionResult TestToken()
        {
            var userId = _currentUserService.UserId;
            var email = _currentUserService.Email;
            var fullname = _currentUserService.Fullname;
            var roleId = _currentUserService.RoleId;

            return Ok(new APIReturn
            {
                code = 200,
                message = "Token hợp lệ",
                data = new List<object>
                {
                    new
                    {
                        userId,
                        email,
                        fullname,
                        roleId,
                        timestamp = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
                    }
                }
            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
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

                // Call service register
                var success = await _authService.RegisterAsync(request);

                // Registration failed (email exists)
                if (!success)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Email đã tồn tại hoặc có lỗi xảy ra",
                        data = new List<object>()
                    });
                }

                // Registration success - return empty data array (email returned to client is not necessary)
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
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

        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string email, [FromQuery] string token)
        {
            try
            {
                var request = new VerifyEmailRequestDto
                {
                    Email = email,
                    Token = token
                };

                var success = await _authService.VerifyEmailAsync(request);

                if (!success)
                {
                    return Content(@"
                        <html>
                        <head><title>Xác thực thất bại</title></head>
                        <body style='font-family: Arial; text-align: center; padding: 50px;'>
                            <h1 style='color: #f44336;'>❌ Xác thực thất bại</h1>
                            <p>Link xác thực không hợp lệ hoặc đã hết hạn.</p>
                            <p>Vui lòng yêu cầu gửi lại email xác thực.</p>
                        </body>
                        </html>
                    ", "text/html");
                }

                // Check if user is Lecturer (RoleId = 4) by querying account
                var account = await _accountRepository.GetByEmailAsync(email);
                bool isLecturer = account?.RoleId == 4;

                var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:5173";

                // Lecturer: redirect to apply CV page
                if (isLecturer)
                {
                    var applyUrl = $"{frontendUrl}/apply-cv?email={Uri.EscapeDataString(email)}";
                    return Content($@"
                        <html>
                        <head>
                            <title>Xác thực thành công</title>
                            <meta http-equiv='refresh' content='3;url={applyUrl}'>
                        </head>
                        <body style='font-family: Arial; text-align: center; padding: 50px;'>
                            <h1 style='color: #4CAF50;'>✅ Xác thực email thành công!</h1>
                            <p>Email đã được xác thực. Vui lòng nộp CV để hoàn tất đăng ký làm giảng viên.</p>
                            <p style='margin-top: 20px; color: #666;'>Bạn sẽ được chuyển hướng đến trang nộp CV trong 3 giây...</p>
                            <a href='{applyUrl}' style='display: inline-block; margin-top: 20px; padding: 10px 30px; background: #2196F3; color: white; text-decoration: none; border-radius: 5px;'>Nộp CV ngay</a>
                        </body>
                        </html>
                    ", "text/html");
                }

                // Student and others: redirect to login page
                var loginUrl = $"{frontendUrl}/login";
                return Content($@"
                    <html>
                    <head>
                        <title>Xác thực thành công</title>
                        <meta http-equiv='refresh' content='3;url={loginUrl}'>
                    </head>
                    <body style='font-family: Arial; text-align: center; padding: 50px;'>
                        <h1 style='color: #4CAF50;'>✅ Xác thực thành công!</h1>
                        <p>Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.</p>
                        <p style='margin-top: 20px; color: #666;'>Bạn sẽ được chuyển hướng đến trang đăng nhập trong 3 giây...</p>
                        <a href='{loginUrl}' style='display: inline-block; margin-top: 20px; padding: 10px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;'>Đăng nhập</a>
                    </body>
                    </html>
                ", "text/html");
            }
            catch (Exception ex)
            {
                return Content($@"
                    <html>
                    <head><title>Lỗi</title></head>
                    <body style='font-family: Arial; text-align: center; padding: 50px;'>
                        <h1 style='color: #f44336;'>❌ Có lỗi xảy ra</h1>
                        <p>{ex.Message}</p>
                    </body>
                    </html>
                ", "text/html");
            }
        }

        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOtp([FromBody] ResendOtpRequestDto request)
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

                // Call service resend verification email
                var result = await _authService.ResendVerifyEmailAsync(request);

                // Resend failed
                if (!result)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Không thể gửi lại email xác thực. Email không tồn tại hoặc tài khoản đã được kích hoạt",
                        data = new List<object>()
                    });
                }

                // Resend success
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Email xác thực đã được gửi lại thành công",
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

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequestDto request)
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

                // Call service Google login
                var result = await _authService.GoogleLoginAsync(request);

                // Google login failed (invalid token or banned account)
                if (result == null)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Token Google không hợp lệ hoặc tài khoản đã bị khóa",
                        data = new List<object>()
                    });
                }

                // Google login success
                var message = result.IsNewUser
                    ? "Đăng ký và đăng nhập bằng Google thành công"
                    : "Đăng nhập bằng Google thành công";

                return Ok(new APIReturn
                {
                    code = 200,
                    message = message,
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

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
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

                var result = await _authService.ForgotPasswordAsync(request);

                if (!result)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Email không tồn tại hoặc chưa được xác thực",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Email khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.",
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

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
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

                var result = await _authService.ResetPasswordAsync(request);

                if (!result)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Token không hợp lệ hoặc đã hết hạn",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.",
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


        [HttpPost("apply-cv")]
        public async Task<IActionResult> ApplyCV([FromForm] ApplyCvRequestDto request)
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

                var result = await _authService.ApplyCvAsync(request);

                if (!result)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Không thể nộp CV. Email không tồn tại, đã nộp CV trước đó, hoặc tài khoản không phải là giảng viên.",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Nộp CV thành công. Vui lòng chờ admin phê duyệt để kích hoạt tài khoản.",
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
