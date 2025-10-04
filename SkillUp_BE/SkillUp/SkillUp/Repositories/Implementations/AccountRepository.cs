using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class AccountRepository : IAccountRepository
    {
        private readonly SkillUpContext _context;

        public AccountRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<Account?> GetByIdAsync(Guid id)
        {
            return await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<Account?> GetByEmailAsync(string email)
        {
            return await _context.Accounts
                .FirstOrDefaultAsync(a => a.Email == email);
        }

        public async Task<Account?> GetByEmailWithRoleAsync(string email)
        {
            return await _context.Accounts
                .Include(a => a.Role)
                .FirstOrDefaultAsync(a => a.Email == email);
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await _context.Accounts
                .AnyAsync(a => a.Email == email);
        }

        public async Task AddAsync(Account account)
        {
            await _context.Accounts.AddAsync(account);
        }

        public async Task UpdateAsync(Account account)
        {
            _context.Accounts.Update(account);
            await Task.CompletedTask;
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
