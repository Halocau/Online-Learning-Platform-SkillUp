using SkillUp.BussinessObjects.DTOs.Cart;
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
    public interface ICartService
    {
        Task<CartDto> GetCartByAccountIdAsync(Guid accountId);
        Task<bool> AddToCartByAccountIdAsync(Guid accountId, AddToCartRequestDto request);
        Task<bool> RemoveFromCartAsync(Guid cartItemId);
        Task<BulkAddToCartResultDto> BulkAddToCartByAccountIdAsync(Guid accountId, IEnumerable<AddToCartRequestDto> items);
        Task<bool> ClearCartAsync(Guid accountId);
        Task<bool> CreateCartIfNotExistsAsync(Guid accountId);
    }
}
