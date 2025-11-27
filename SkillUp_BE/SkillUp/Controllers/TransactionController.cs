using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _transactionService;
        private readonly ICurrentUserService _currentUserService; 

        public TransactionController(ITransactionService transactionService, ICurrentUserService currentUserService)
        {
            _transactionService = transactionService;
            _currentUserService = currentUserService;
        }

        [HttpGet("history")]
        [Authorize]
        public async Task<IActionResult> GetPurchaseHistory()
        {
            try
            {
                var accountId = _currentUserService.UserId;
                if (!accountId.HasValue)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ",
                        data = new List<object>()
                    });
                }
                var history = await _transactionService.GetStudentPurchaseHistoryAsync(accountId.Value);
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy lịch sử giao dịch thành công",
                    data = new List<object> { history }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Có lỗi xảy ra: {ex.Message}",
                    data = new List<object>()
                });
            }
        }
    }
}
