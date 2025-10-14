namespace SkillUp.Services.Interfaces
{
    public interface IEmailService
    {
        Task<bool> SendOtpEmailAsync(string toEmail, string otpCode, string fullname);
        Task<bool> SendVerifyEmailAsync(string toEmail, string verifyToken, string fullname);
    }
}
