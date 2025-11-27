using SkillUp.BussinessObjects.DTOs.PurchaseHistory;

namespace SkillUp.Services.Interfaces
{
    public interface ITransactionService
    {
        Task<List<PurchaseHistoryDto>> GetStudentPurchaseHistoryAsync(Guid accountId);
    }
}
