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
    }
}
