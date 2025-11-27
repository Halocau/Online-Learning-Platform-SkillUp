
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ITransactionRepository
    {
        Task<List<Transaction>> GetTransactionHistoryByAccountIdAsync(Guid accountId);
    }
}
