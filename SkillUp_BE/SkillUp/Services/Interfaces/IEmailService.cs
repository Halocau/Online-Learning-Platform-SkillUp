using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendOtpEmailAsync(string toEmail, string otpCode, string fullname);
        Task<bool> SendVerifyEmailAsync(string toEmail, string verifyToken, string fullname);
        Task<bool> SendResetPasswordEmailAsync(string toEmail, string resetToken, string fullname);
        Task<bool> SendLecturerApplicationStatusEmailAsync(Account account, bool isApproved, string reason);
    }
}
