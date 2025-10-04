using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IAccountRepository
    {
        Task<Account?> GetByIdAsync(Guid id);
        Task<Account?> GetByEmailAsync(string email);
        Task<Account?> GetByEmailWithRoleAsync(string email);
        Task<bool> ExistsByEmailAsync(string email);
        Task AddAsync(Account account);
        Task UpdateAsync(Account account);
        Task<bool> SaveChangesAsync();
    }
}
