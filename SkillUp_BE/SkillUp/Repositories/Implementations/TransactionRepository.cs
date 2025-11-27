using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class TransactionRepository : ITransactionRepository
    {
        private readonly SkillUpContext _context;

        public TransactionRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<List<Transaction>> GetTransactionHistoryByAccountIdAsync(Guid accountId)
        {
            return await _context.Transactions
                .Where(t => t.AccountId == accountId) 
                .Include(t => t.TransactionDetails)
                    .ThenInclude(td => td.Course)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

    }
}
