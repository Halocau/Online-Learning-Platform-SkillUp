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
        private readonly IStudentRepository _studentRepository;

        public CartService(ICartRepository cartRepository, IStudentRepository studentRepository)
        {
            _cartRepository = cartRepository;
            _studentRepository = studentRepository;
        }

        private async Task<Student> GetStudentByAccountIdAsync(Guid accountId)
        {
            var student = await _studentRepository.GetByAccountIdAsync(accountId);
            if (student == null)
            {
                throw new InvalidOperationException("Student not found.");
            }
            return student;
        }

        public async Task<bool> AddToCartByAccountIdAsync(Guid accountId, AddToCartRequestDto request)
        {
            var student = await GetStudentByAccountIdAsync(accountId);

            var cart = await _cartRepository.GetCartByStudentIdAsync(student.Id);
            if (cart == null)
            {
                cart = new Cart
                {
                    Id = Guid.NewGuid(),
                    StudentId = student.Id
                };
                await _cartRepository.AddCart(cart);
            }

            var cartItem = new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                CourseId = request.CourseId,
                Price = request.Price
            };

            await _cartRepository.AddToCartAsync(cartItem);

            return await _cartRepository.SaveChangesAsync();
        }

        public async Task<CartDto> GetCartByAccountIdAsync(Guid accountId)
        {
            var student = await GetStudentByAccountIdAsync(accountId);

            var cart = await _cartRepository.GetCartByStudentIdAsync(student.Id);
            if (cart == null)
            {
                return null;
            }

            return new CartDto
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
        }

        public async Task<bool> RemoveFromCartAsync(Guid cartItemId)
        {
            await _cartRepository.RemoveFromCartAsync(cartItemId);
            return await _cartRepository.SaveChangesAsync();
        }
    }
}
