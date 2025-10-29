using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.DTOs.Cart;
using SkillUp.BussinessObjects.DTOs.Course;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;
        public CartService(ICartRepository cartRepository)
        {
            _cartRepository = cartRepository;
        }
        public async Task<bool> AddToCartAsync(Guid studentId, Guid courseId, decimal price)
        {
            try
            {
                var cart = await _cartRepository.GetCartByStudentIdAsync(studentId);
                if (cart == null)
                {
                    // Nếu giỏ hàng chưa có, tạo mới
                    cart = new Cart
                    {
                        Id = Guid.NewGuid(),
                        StudentId = studentId
                    };
                    await _cartRepository.AddCart(cart); 
                    await _cartRepository.SaveChangesAsync(); 
                }


                // Thêm sản phẩm vào giỏ hàng
                var cartItem = new CartItem
                {
                    Id = Guid.NewGuid(),
                    CartId = cart.Id,
                    CourseId = courseId,
                    Price = price
                };

                // Thêm sản phẩm vào giỏ hàng
                await _cartRepository.AddToCartAsync(cartItem);

                // Lưu thay đổi
                return await _cartRepository.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log chi tiết lỗi
                Console.WriteLine($"Error: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                throw;  // Đẩy lỗi lên để API controller có thể xử lý
            }
        }

        public async Task<CartDto> GetCartAsync(Guid studentId)
        {
           var cart = await _cartRepository.GetCartByStudentIdAsync(studentId);
            if (cart == null)
            {
                return null;
            }

            var cartDto = new CartDto
            {
                Id = cart.Id,
                StudentId = cart.StudentId,
                CartItems = cart.CartItems.Select(ci => new CartItemDto
                {
                    Id = ci.Id,
                    CourseId = ci.CourseId,
                    Price = ci.Price,
                    Course = new CourseCartDto
                    {
                        Title = ci.Course.Title,
                        Image = ci.Course.Image
                    }
                }).ToList()
            };

            return cartDto;
        }

        public async Task<bool> RemoveFromCartAsync(Guid cartItemId)
        {
            await _cartRepository.RemoveFromCartAsync(cartItemId);
            return await _cartRepository.SaveChangesAsync();
        }
    }
}
