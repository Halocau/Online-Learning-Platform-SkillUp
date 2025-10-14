//using SkillUp.BussinessObjects.DTOs.Auth;
//using SkillUp.BussinessObjects.Models;
//using System.Security.Claims;

//namespace SkillUp.Services.Interfaces
//{
//    public interface IAuthService
//    {

//        public Task<LoginResponseDto?> LoginAsync(LoginRequestDto request);

//        public Task<RefreshTokenResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request);

//        public Task<bool> LogoutAsync(Guid userId);

//        public Task<RegisterResponseDto?> RegisterAsync(RegisterRequestDto request);

//        public Task<bool> VerifyEmailAsync(VerifyEmailRequestDto request);

//        public Task<bool> ResendVerifyEmailAsync(ResendOtpRequestDto request);

//        public Task<GoogleLoginResponseDto?> GoogleLoginAsync(GoogleLoginRequestDto request);

//        public string GenerateAccessToken(Account account);

//        public string GenerateRefreshToken();

//        public ClaimsPrincipal? GetPrincipalFromToken(string token);

//        public string HashPassword(string password);

//        public bool VerifyPassword(string password, string hashedPassword);
//    }
//}
