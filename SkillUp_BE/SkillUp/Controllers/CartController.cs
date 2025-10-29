using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Cart;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;
        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }
        [HttpGet("Cart/{studentId}")]
        public async Task<IActionResult> ViewCart(Guid studentId)
        {
            try
            {
                var cart = await _cartService.GetCartAsync(studentId);
                if (cart == null || !cart.CartItems.Any())
                {
                    return NotFound(new APIReturn
                    {
                        code = 404,
                        message = "Giỏ hàng trống",
                        data = new List<object>()
                    });
                }
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Giỏ hàng của bạn",
                    data = new List<object> { cart }
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

        // Thêm sản phẩm vào giỏ hàng
        [HttpPost("AddToCart/{studentId}")]
        public async Task<IActionResult> AddToCart(Guid studentId, [FromBody] AddToCartRequestDto request)
        {
            try
            {
                var result = await _cartService.AddToCartAsync(studentId, request.CourseId, request.Price);
                if (result)
                {
                    return Ok(new APIReturn
                    {
                        code = 200,
                        message = "Thêm vào giỏ hàng thành công!",
                        data = new List<object>()
                    });
                }
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = "Không thể thêm vào giỏ hàng",
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

        // Xóa sản phẩm khỏi giỏ hàng
        [HttpDelete("RemoveFromCart/{cartItemId}")]
        public async Task<IActionResult> RemoveFromCart(Guid cartItemId)
        {
            try
            {
                var result = await _cartService.RemoveFromCartAsync(cartItemId);
                if (result)
                {
                    return Ok(new APIReturn
                    {
                        code = 200,
                        message = "Xóa khỏi giỏ hàng thành công!",
                        data = new List<object>()
                    });
                }
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = "Không thể xóa khỏi giỏ hàng",
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