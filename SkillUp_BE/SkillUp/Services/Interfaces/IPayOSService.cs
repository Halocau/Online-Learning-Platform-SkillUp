using SkillUp.BussinessObjects.DTOs.PayOS;
using System.Text.Json;

namespace SkillUp.Services.Interfaces
{
    public interface IPayOSService
    {
        Task<CoursePaymentResponseDto> CreateCoursePaymentAsync(Guid accountId, CoursePaymentRequestDto request);
        Task<bool> VerifyPaymentAndEnrollAsync(string orderCode);
        Task<bool> CancelPaymentAsync(string orderCode);
        Task<bool> ProcessPaymentWebhookAsync(JsonElement payload);
        Task<List<CourseEnrollmentDto>> GetUserEnrollmentsAsync(Guid accountId);
    }
}
