using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ICartRepository
    {
        Task<Cart> GetCartByStudentIdAsync(Guid studentId);
        Task AddToCartAsync(CartItem cartItem);
        Task AddCart(Cart cart);
        Task RemoveFromCartAsync(Guid cartItemId);
        Task<bool> SaveChangesAsync();
    }
}
