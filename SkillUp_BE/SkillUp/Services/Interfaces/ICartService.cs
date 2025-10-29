using SkillUp.BussinessObjects.DTOs.Cart;
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
    public interface ICartService
    {
        Task<CartDto> GetCartAsync(Guid studentId);
        Task<bool> AddToCartAsync(Guid studentId, Guid courseId, decimal price);
        Task<bool> RemoveFromCartAsync(Guid cartItemId);
    }
}
