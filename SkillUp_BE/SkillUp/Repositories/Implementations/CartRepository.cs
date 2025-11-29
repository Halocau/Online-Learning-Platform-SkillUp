using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class CartRepository : ICartRepository
    {
        private readonly SkillUpContext _context;
        public CartRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<Cart> GetCartByStudentIdAsync(Guid studentId)
        {
            return await _context.Set<Cart>()
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Course) 
                        .ThenInclude(course => course.Lecturer) 
                            .ThenInclude(lecturer => lecturer.Account) 
                .FirstOrDefaultAsync(c => c.StudentId == studentId);
        }

        public async Task AddToCartAsync(CartItem cartItem)
        {
            await _context.CartItems.AddAsync(cartItem);
        }

        public async Task RemoveFromCartAsync(Guid cartItemId)
        {
            var cartItem = await _context.CartItems.FindAsync(cartItemId);
            if (cartItem != null)
            {
                _context.CartItems.Remove(cartItem);
            }
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task AddCart(Cart cart)
        {
            await _context.Carts.AddAsync(cart);
        }

        public async Task AddCartItemsRangeAsync(IEnumerable<CartItem> items)
        {
            await _context.CartItems.AddRangeAsync(items);
        }

        //lấy danh sách CourseId đã có trong cart để lọc trùng nhanh
        public async Task<HashSet<Guid>> GetCourseIdsInCartAsync(Guid cartId)
        {
            return (await _context.CartItems
                .Where(ci => ci.CartId == cartId)
                .Select(ci => ci.CourseId)
                .ToListAsync()).ToHashSet();
        }

        // Kiểm tra xem student đã đăng ký course chưa
        public async Task<bool> IsStudentEnrolledInCourseAsync(Guid studentId, Guid courseId)
        {
            return await _context.Enrollments
                .AnyAsync(e => e.StudentId == studentId && e.CourseId == courseId);
        }

        // Xóa tất cả items trong cart
        public async Task ClearCartAsync(Guid studentId)
        {
            var cart = await GetCartByStudentIdAsync(studentId);
            if (cart != null && cart.CartItems != null && cart.CartItems.Any())
            {
                _context.CartItems.RemoveRange(cart.CartItems);
            }
        }
    }
}
