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
        [HttpGet("{accountId}")]
        public async Task<IActionResult> ViewCart(Guid accountId)
        {
            try
            {
                var cart = await _cartService.GetCartByAccountIdAsync(accountId);
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


        [HttpPost("AddToCart/{accountId}")]
        public async Task<IActionResult> AddToCart(Guid accountId, [FromBody] AddToCartRequestDto request)
        {
            try
            {
                var result = await _cartService.AddToCartByAccountIdAsync(accountId, request);
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
            catch (InvalidOperationException ex)
            {
                // Xử lý lỗi khi đã enrolled
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = ex.Message,
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


        [HttpPost("bulk-add/{accountId}")]
        public async Task<IActionResult> BulkAdd(Guid accountId, [FromBody] BulkAddToCartRequestDto request)
        {
            try
            {
                if (request?.Items == null || request.Items.Count == 0)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Danh sách items rỗng.",
                        data = new List<object>()
                    });
                }

                var result = await _cartService.BulkAddToCartByAccountIdAsync(accountId, request.Items);

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Đồng bộ giỏ hàng (bulk-add) thành công.",
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

        [HttpPost("clear/{accountId}")]
        [Authorize]
        public async Task<IActionResult> ClearCart(Guid accountId)
        {
            try
            {
                var result = await _cartService.ClearCartAsync(accountId);
                if (result)
                {
                    return Ok(new APIReturn
                    {
                        code = 200,
                        message = "Xóa giỏ hàng thành công!",
                        data = new List<object>()
                    });
                }
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = "Không thể xóa giỏ hàng",
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