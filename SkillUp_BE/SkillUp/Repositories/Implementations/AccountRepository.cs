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
            return await _context.Accounts.Include(a => a.Role)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<Account?> GetByEmailAsync(string email)
        {
            return await _context.Accounts
                .FirstOrDefaultAsync(a => a.Email == email);
        }

        public async Task<Account?> GetByEmailWithRoleAndPermissionsAsync(string email)
        {
            return await _context.Accounts
                .Include(a => a.Role)
                    .ThenInclude(r => r!.RolePermissions)
                        .ThenInclude(rp => rp.Permission)
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

        public async Task<bool> UpdateStatusAsync(Guid accountId, string newStatus)
        {
            var account = await _context.Accounts
                .FirstOrDefaultAsync(a => a.Id == accountId);

            if (account == null)
            {
                return false; 
            }

            account.Status = newStatus;

            _context.Accounts.Update(account);

            return await _context.SaveChangesAsync() > 0;
        }


        public async Task<List<Account>> GetAllAccountsAsync()
        {
            return await _context.Accounts
                .Where(a => a.RoleId == 4 || a.RoleId == 5) 
                .Include(a => a.Role) 
                .OrderBy(a => a.Fullname)
                .ToListAsync();
        }

        public async Task<List<Account>> GetAllModeratorsAsync()
        {
            return await _context.Accounts
                .Where(a => a.RoleId == 2 || a.RoleId == 3) 
                .Include(a => a.Role) 
                .OrderBy(a => a.Fullname)
                .ToListAsync();
		}
        public async Task<List<Guid>> GetAllActiveAccountIdsAsync()
        {
            return await _context.Accounts
                .Where(a => a.Status == "Active")
                .Select(a => a.Id)
                .ToListAsync();
        }
    }
}
