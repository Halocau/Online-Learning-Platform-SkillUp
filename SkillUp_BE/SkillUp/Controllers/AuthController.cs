//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;
//using SkillUp.BussinessObjects.DTOs.Auth;
//using SkillUp.ExceptionHandling;
//using SkillUp.Services.Interfaces;

//namespace SkillUp.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class AuthController : ControllerBase
//    {
//        private readonly IAuthService _authService;
//        private readonly ICurrentUserService _currentUserService;

//        public AuthController(IAuthService authService, ICurrentUserService currentUserService)
//        {
//            _authService = authService;
//            _currentUserService = currentUserService;
//        }

//        [HttpPost("login")]
//        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
//        {
//            try
//            {
//                if (!ModelState.IsValid)
//                {
//                    return BadRequest(new APIReturn
//                    {
//                        code = 400,
//                        message = "Dữ liệu không hợp lệ",
//                        data = new List<object> { ModelState }
//                    });
//                }

//                // call service login
//                var result = await _authService.LoginAsync(request);

//                // fail login
//                if (result == null)
//                {
//                    return Unauthorized(new APIReturn
//                    {
//                        code = 401,
//                        message = "Email hoặc mật khẩu không đúng",
//                        data = new List<object>()
//                    });
//                }

//                // Login success
//                return Ok(new APIReturn
//                {
//                    code = 200,
//                    message = "Đăng nhập thành công",
//                    data = new List<object> { result }
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new APIReturn
//                {
//                    code = 500,
//                    message = $"Có lỗi xảy ra: {ex.Message}",
//                    data = new List<object>()
//                });
//            }
//        }


//        [HttpPost("refresh-token")]
//        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
//        {
//            try
//            {
//                if (!ModelState.IsValid)
//                {
//                    return BadRequest(new APIReturn
//                    {
//                        code = 400,
//                        message = "Dữ liệu không hợp lệ",
//                        data = new List<object> { ModelState }
//                    });
//                }

//                // call service  refresh token
//                var result = await _authService.RefreshTokenAsync(request);

//                // refresh token fail
//                if (result == null)
//                {
//                    return Unauthorized(new APIReturn
//                    {
//                        code = 401,
//                        message = "Token không hợp lệ hoặc đã hết hạn",
//                        data = new List<object>()
//                    });
//                }

//                // Refresh succcess
//                return Ok(new APIReturn
//                {
//                    code = 200,
//                    message = "Làm mới token thành công",
//                    data = new List<object> { result }
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new APIReturn
//                {
//                    code = 500,
//                    message = $"Có lỗi xảy ra: {ex.Message}",
//                    data = new List<object>()
//                });
//            }
//        }


//        [HttpPost("logout")]
//        [Authorize]
//        public async Task<IActionResult> Logout()
//        {
//            try
//            {
//                // Lấy userId từ ICurrentUserService
//                var userId = _currentUserService.UserId;
//                if (!userId.HasValue)
//                {
//                    return Unauthorized(new APIReturn
//                    {
//                        code = 401,
//                        message = "Token không hợp lệ",
//                        data = new List<object>()
//                    });
//                }

//                // call service logout
//                var result = await _authService.LogoutAsync(userId.Value);

//                // fail logout
//                if (!result)
//                {
//                    return BadRequest(new APIReturn
//                    {
//                        code = 400,
//                        message = "Đăng xuất thất bại",
//                        data = new List<object>()
//                    });
//                }

//                // Logout success
//                return Ok(new APIReturn
//                {
//                    code = 200,
//                    message = "Đăng xuất thành công",
//                    data = new List<object>()
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new APIReturn
//                {
//                    code = 500,
//                    message = $"Có lỗi xảy ra: {ex.Message}",
//                    data = new List<object>()
//                });
//            }
//        }

//        [HttpPost("register")]
//        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
//        {
//            try
//            {
//                if (!ModelState.IsValid)
//                {
//                    return BadRequest(new APIReturn
//                    {
//                        code = 400,
//                        message = "Dữ liệu không hợp lệ",
//                        data = new List<object> { ModelState }
//                    });
//                }

//                // Call service register
//                var result = await _authService.RegisterAsync(request);

//                // Registration failed (email exists)
//                if (result == null)
//                {
//                    return BadRequest(new APIReturn
//                    {
//                        code = 400,
//                        message = "Email đã tồn tại hoặc có lỗi xảy ra",
//                        data = new List<object>()
//                    });
//                }

//                // Registration success
//                return Ok(new APIReturn
//                {
//                    code = 200,
//                    message = "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
//                    data = new List<object> { result }
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new APIReturn
//                {
//                    code = 500,
//                    message = $"Có lỗi xảy ra: {ex.Message}",
//                    data = new List<object>()
//                });
//            }
//        }

//        [HttpGet("verify-email")]
//        public async Task<IActionResult> VerifyEmail([FromQuery] string email, [FromQuery] string token)
//        {
//            try
//            {
//                Console.WriteLine($"[VerifyEmail] Email: {email}");
//                Console.WriteLine($"[VerifyEmail] Token: {token}");

//                var request = new VerifyEmailRequestDto
//                {
//                    Email = email,
//                    Token = token
//                };

//                // Call service verify email
//                var result = await _authService.VerifyEmailAsync(request);

//                Console.WriteLine($"[VerifyEmail] Result: {result}");

//                // Verification failed
//                if (!result)
//                {
//                    Console.WriteLine("[VerifyEmail] Returning FAILED HTML");
//                    return Content(@"
//                        <html>
//                        <head><title>Xác thực thất bại</title></head>
//                        <body style='font-family: Arial; text-align: center; padding: 50px;'>
//                            <h1 style='color: #f44336;'>❌ Xác thực thất bại</h1>
//                            <p>Link xác thực không hợp lệ hoặc đã hết hạn.</p>
//                            <p>Vui lòng yêu cầu gửi lại email xác thực.</p>
//                        </body>
//                        </html>
//                    ", "text/html");
//                }

//                // Verification success
//                Console.WriteLine("[VerifyEmail] Returning SUCCESS HTML");
//                return Content(@"
//                    <html>
//                    <head><title>Xác thực thành công</title></head>
//                    <body style='font-family: Arial; text-align: center; padding: 50px;'>
//                        <h1 style='color: #4CAF50;'>✅ Xác thực thành công!</h1>
//                        <p>Tài khoản của bạn đã được kích hoạt.</p>
//                        <p>Bạn có thể đăng nhập ngay bây giờ.</p>
//                        <a href='/login' style='display: inline-block; margin-top: 20px; padding: 10px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;'>Đăng nhập</a>
//                    </body>
//                    </html>
//                ", "text/html");
//            }
//            catch (Exception ex)
//            {
//                Console.WriteLine($"[VerifyEmail] EXCEPTION: {ex.Message}");
//                return Content($@"
//                    <html>
//                    <head><title>Lỗi</title></head>
//                    <body style='font-family: Arial; text-align: center; padding: 50px;'>
//                        <h1 style='color: #f44336;'>❌ Có lỗi xảy ra</h1>
//                        <p>{ex.Message}</p>
//                    </body>
//                    </html>
//                ", "text/html");
//            }
//        }

//        [HttpPost("resend-otp")]
//        public async Task<IActionResult> ResendOtp([FromBody] ResendOtpRequestDto request)
//        {
//            try
//            {
//                if (!ModelState.IsValid)
//                {
//                    return BadRequest(new APIReturn
//                    {
//                        code = 400,
//                        message = "Dữ liệu không hợp lệ",
//                        data = new List<object> { ModelState }
//                    });
//                }

//                // Call service resend verification email
//                var result = await _authService.ResendVerifyEmailAsync(request);

//                // Resend failed
//                if (!result)
//                {
//                    return BadRequest(new APIReturn
//                    {
//                        code = 400,
//                        message = "Không thể gửi lại email xác thực. Email không tồn tại hoặc tài khoản đã được kích hoạt",
//                        data = new List<object>()
//                    });
//                }

//                // Resend success
//                return Ok(new APIReturn
//                {
//                    code = 200,
//                    message = "Email xác thực đã được gửi lại thành công",
//                    data = new List<object>()
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new APIReturn
//                {
//                    code = 500,
//                    message = $"Có lỗi xảy ra: {ex.Message}",
//                    data = new List<object>()
//                });
//            }
//        }

//        [HttpPost("google-login")]
//        public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequestDto request)
//        {
//            try
//            {
//                if (!ModelState.IsValid)
//                {
//                    return BadRequest(new APIReturn
//                    {
//                        code = 400,
//                        message = "Dữ liệu không hợp lệ",
//                        data = new List<object> { ModelState }
//                    });
//                }

//                // Call service Google login
//                var result = await _authService.GoogleLoginAsync(request);

//                // Google login failed (invalid token or banned account)
//                if (result == null)
//                {
//                    return Unauthorized(new APIReturn
//                    {
//                        code = 401,
//                        message = "Token Google không hợp lệ hoặc tài khoản đã bị khóa",
//                        data = new List<object>()
//                    });
//                }

//                // Google login success
//                var message = result.IsNewUser
//                    ? "Đăng ký và đăng nhập bằng Google thành công"
//                    : "Đăng nhập bằng Google thành công";

//                return Ok(new APIReturn
//                {
//                    code = 200,
//                    message = message,
//                    data = new List<object> { result }
//                });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, new APIReturn
//                {
//                    code = 500,
//                    message = $"Có lỗi xảy ra: {ex.Message}",
//                    data = new List<object>()
//                });
//            }
//        }
//    }
//}
