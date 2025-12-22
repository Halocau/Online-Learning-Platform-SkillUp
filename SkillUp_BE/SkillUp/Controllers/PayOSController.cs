using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.PayOS;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;
using System.Text.Json;

namespace SkillUp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly IPayOSService _payosService;
        private readonly ICurrentUserService _currentUserService;

        public PaymentController(IPayOSService payosService, ICurrentUserService currentUserService)
        {
            _payosService = payosService;
            _currentUserService = currentUserService;
        }

        [HttpPost("create-course-payment")]
        [Authorize]
        public async Task<IActionResult> CreateCoursePayment([FromBody] CoursePaymentRequestDto request)
        {
            try
            {
                var userId = _currentUserService.UserId;
                if (!userId.HasValue)
                {
                    return Ok(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ hoặc không tìm thấy ID người dùng",
                        data = new List<object>()
                    });
                }

                var result = await _payosService.CreateCoursePaymentAsync(userId.Value, request);

                if (!result.Success)
                {
                    return Ok(new APIReturn
                    {
                        code = 400,
                        message = result.Message,
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = result.Message,
                    data = new List<object> { result }
                });
            }
            catch (Exception ex)
            {
                return Ok(new APIReturn
                {
                    code = 500,
                    message = $"Lỗi: {ex.Message}",
                    data = new List<object>()
                });
            }
        }

        /// <summary>
        /// Verify thanh toán và tự động enrollment (callback từ FE sau khi thanh toán)
        /// </summary>
        [HttpGet("verify-course-payment/{orderCode}")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyCoursePayment(string orderCode)
        {
            try
            {
                var result = await _payosService.VerifyPaymentAndEnrollAsync(orderCode);

                if (!result)
                {
                    return Ok(new APIReturn
                    {
                        code = 404,
                        message = "Không tìm thấy giao dịch hoặc đã xử lý trước đó",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Thanh toán và đăng ký khóa học thành công",
                    data = new List<object>()
                });
            }
            catch (Exception ex)
            {
                return Ok(new APIReturn
                {
                    code = 500,
                    message = $"Lỗi: {ex.Message}",
                    data = new List<object>()
                });
            }
        }

        /// <summary>
        /// Hủy thanh toán (callback từ FE khi user hủy)
        /// </summary>
        [HttpPost("cancel-course-payment/{orderCode}")]
        [AllowAnonymous]
        public async Task<IActionResult> CancelCoursePayment(string orderCode)
        {
            try
            {
                var result = await _payosService.CancelPaymentAsync(orderCode);

                if (!result)
                {
                    return Ok(new APIReturn
                    {
                        code = 404,
                        message = "Không tìm thấy giao dịch",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Đã hủy giao dịch",
                    data = new List<object>()
                });
            }
            catch (Exception ex)
            {
                return Ok(new APIReturn
                {
                    code = 500,
                    message = $"Lỗi: {ex.Message}",
                    data = new List<object>()
                });
            }
        }

        /// <summary>
        /// Webhook từ PayOS cho course payment
        /// </summary>
        [HttpPost("course-webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> CourseWebhook([FromBody] JsonElement payload)
        {
            try
            {
                var result = await _payosService.ProcessPaymentWebhookAsync(payload);

                if (!result)
                {
                    return Ok(new APIReturn
                    {
                        code = 400,
                        message = "Invalid signature hoặc không tìm thấy giao dịch",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Webhook processed successfully",
                    data = new List<object>()
                });
            }
            catch (Exception ex)
            {
                return Ok(new APIReturn
                {
                    code = 500,
                    message = $"Lỗi: {ex.Message}",
                    data = new List<object>()
                });
            }
        }

        /// <summary>
        /// Lấy danh sách khóa học đã đăng ký
        /// </summary>
        [HttpGet("my-enrollments")]
        [Authorize]
        public async Task<IActionResult> GetMyEnrollments()
        {
            try
            {
                var userId = _currentUserService.UserId;
                if (!userId.HasValue)
                {
                    return Ok(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ hoặc không tìm thấy ID người dùng",
                        data = new List<object>()
                    });
                }

                var result = await _payosService.GetUserEnrollmentsAsync(userId.Value);

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy danh sách khóa học thành công",
                    data = new List<object> { result }
                });
            }
            catch (Exception ex)
            {
                return Ok(new APIReturn
                {
                    code = 500,
                    message = $"Lỗi: {ex.Message}",
                    data = new List<object>()
                });
            }
        }

        /// <summary>
        /// Tạo thanh toán cho giỏ hàng qua PayOS
        /// </summary>
        [HttpPost("create-cart-payment")]
        [Authorize]
        public async Task<IActionResult> CreateCartPayment([FromBody] CartPaymentRequestDto request)
        {
            try
            {
                var userId = _currentUserService.UserId;
                if (!userId.HasValue)
                {
                    return Ok(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ hoặc không tìm thấy ID người dùng",
                        data = new List<object>()
                    });
                }

                var result = await _payosService.CreateCartPaymentAsync(userId.Value, request);

                if (!result.Success)
                {
                    return Ok(new APIReturn
                    {
                        code = 400,
                        message = result.Message,
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = result.Message,
                    data = new List<object> { result }
                });
            }
            catch (Exception ex)
            {
                return Ok(new APIReturn
                {
                    code = 500,
                    message = $"Lỗi: {ex.Message}",
                    data = new List<object>()
                });
            }
        }

        /// <summary>
        /// Verify thanh toán cart và tự động enrollment (callback từ FE sau khi thanh toán)
        /// </summary>
        [HttpGet("verify-cart-payment/{orderCode}")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyCartPayment(string orderCode)
        {
            try
            {
                var result = await _payosService.VerifyCartPaymentAndEnrollAsync(orderCode);

                if (!result)
                {
                    return Ok(new APIReturn
                    {
                        code = 404,
                        message = "Không tìm thấy giao dịch hoặc đã xử lý trước đó",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Thanh toán và đăng ký khóa học thành công",
                    data = new List<object>()
                });
            }
            catch (Exception ex)
            {
                return Ok(new APIReturn
                {
                    code = 500,
                    message = $"Lỗi: {ex.Message}",
                    data = new List<object>()
                });
            }
        }
    }
}
