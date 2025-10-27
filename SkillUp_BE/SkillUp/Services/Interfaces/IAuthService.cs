using SkillUp.BussinessObjects.DTOs.Account;
using SkillUp.BussinessObjects.DTOs.Auth;
using SkillUp.BussinessObjects.Models;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SkillUp.Services.Interfaces
{
    public interface IAuthService
    {

        public Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);

        public Task<RefreshTokenResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request);

        public Task<bool> LogoutAsync(Guid userId);

        public Task<bool> RegisterAsync(RegisterRequestDto request);

        public Task<bool> VerifyEmailAsync(VerifyEmailRequestDto request);

        public Task<bool> ResendVerifyEmailAsync(ResendOtpRequestDto request);

        public Task<GoogleLoginResponseDto?> GoogleLoginAsync(GoogleLoginRequestDto request);

        // Helper to get role id by email so controllers don't need repository access
        public Task<int?> GetRoleIdByEmailAsync(string email);

        public string GenerateAccessToken(Account account);

        public string GenerateRefreshToken();

        public ClaimsPrincipal? GetPrincipalFromToken(string token);

        public string HashPassword(string password);

        public bool VerifyPassword(string password, string hashedPassword);

        public Task<bool> ForgotPasswordAsync(ForgotPasswordRequestDto request);

        public Task<bool> ResetPasswordAsync(ResetPasswordRequestDto request);
       
        public Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequestDto request);

    }
}
