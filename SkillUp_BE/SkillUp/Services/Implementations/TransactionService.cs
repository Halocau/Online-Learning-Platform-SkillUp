using SkillUp.BussinessObjects.DTOs.PurchaseHistory;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class TransactionService : ITransactionService
    {
        private readonly ITransactionRepository _transactionRepository;

        public TransactionService(ITransactionRepository transactionRepository)
        {
            _transactionRepository = transactionRepository;
        }

        public async Task<List<PurchaseHistoryDto>> GetStudentPurchaseHistoryAsync(Guid accountId)
        {
            var transactions = await _transactionRepository.GetTransactionHistoryByAccountIdAsync(accountId);

            return transactions.Select(t => new PurchaseHistoryDto
            {
                TransactionId = t.Id,
                CreatedAt = t.CreatedAt,
                TotalAmount = t.Amount,
                PaymentMethod = t.PaymentMethod,
                Status = t.Status,
                Description = t.Description,

                Courses = t.TransactionDetails.Select(td => new PurchasedCourseDto
                {
                    CourseId = td.CourseId,
                    CourseTitle = td.Course?.Title ?? "Unknown Course",
                    CourseImage = td.Course?.Image,
                    PricePaid = td.Price,
                    LecturerName = td.Course?.Lecturer?.Account?.Fullname ?? "Đang cập nhật",
                    Rating = td.Course?.Rating ?? 0
                }).ToList()
            }).ToList();
        }
    }
}
