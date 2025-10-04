using Microsoft.IdentityModel.Tokens;
using SkillUp.BussinessObjects.DTOs.Auth;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace SkillUp.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IAccountRepository _accountRepository;
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IConfiguration _configuration;

        public AuthService(IAccountRepository accountRepository,
                            IRefreshTokenRepository refreshTokenRepository,
                             IConfiguration configuration)
        {
            _accountRepository = accountRepository;
            _refreshTokenRepository = refreshTokenRepository;
            _configuration = configuration;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
        {
            var account = await _accountRepository.GetByEmailWithRoleAsync(request.Email);
            if (account == null || !VerifyPassword(request.Password, account.Password) || account.Status != "1")
            {
                return null;
            }

            var accessToken = GenerateAccessToken(account);
            var refreshToken = GenerateRefreshToken();

            var refreshTokenEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                Token = refreshToken,
                AccountId = account.Id,
                CreatedUtc = DateTime.UtcNow,
                ExpiresUtc = DateTime.UtcNow.AddDays(7),
                RevokedUtc = null
            };

            await _refreshTokenRepository.AddAsync(refreshTokenEntity);
            await _refreshTokenRepository.SaveChangesAsync();

            return new LoginResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                AccessTokenExpires = DateTime.UtcNow.AddHours(1),
                RefreshTokenExpires = refreshTokenEntity.ExpiresUtc
            };
        }

        public async Task<RefreshTokenResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request)
        {
            var principal = GetPrincipalFromToken(request.AccessToken);
            if (principal == null)
            {
                return null;
            }

            var userIdClaim = principal.Claims.FirstOrDefault(c => c.Type == "userId");
            if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return null;
            }

            var refreshTokenEntity = await _refreshTokenRepository.GetValidTokenByUserIdAsync(userId, request.RefreshToken);
            if (refreshTokenEntity == null)
            {
                return null;
            }

            var emailClaim = principal.Claims.FirstOrDefault(c => 
                c.Type == "email" || 
                c.Type == ClaimTypes.Email || 
                c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress")?.Value;
            
            if (string.IsNullOrEmpty(emailClaim))
            {
                return null;
            }

            var account = await _accountRepository.GetByEmailWithRoleAsync(emailClaim);
            if (account == null || account.Status != "1")
            {
                return null;
            }

            refreshTokenEntity.RevokedUtc = DateTime.UtcNow;
            await _refreshTokenRepository.UpdateAsync(refreshTokenEntity);

            var newAccessToken = GenerateAccessToken(account);
            var newRefreshToken = GenerateRefreshToken();

            var newRefreshTokenEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                Token = newRefreshToken,
                AccountId = account.Id,
                CreatedUtc = DateTime.UtcNow,
                ExpiresUtc = DateTime.UtcNow.AddDays(7),
                RevokedUtc = null
            };

            await _refreshTokenRepository.AddAsync(newRefreshTokenEntity);
            await _refreshTokenRepository.SaveChangesAsync();


            return new RefreshTokenResponseDto
            {
                Tokens = new TokenDto
                {
                    AccessToken = newAccessToken,
                    RefreshToken = newRefreshToken,
                    AccessTokenExpires = DateTime.UtcNow.AddHours(1),
                    RefreshTokenExpires = newRefreshTokenEntity.ExpiresUtc
                }
            };
        }

        public async Task<bool> LogoutAsync(Guid userId)
        {
            await _refreshTokenRepository.RevokeAllUserTokensAsync(userId);
            return await _refreshTokenRepository.SaveChangesAsync();
        }

        public string GenerateAccessToken(Account account)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"] ?? throw new ArgumentNullException("JWT SecretKey not configured");
            var issuer = jwtSettings["Issuer"] ?? "SkillUp";
            var audience = jwtSettings["Audience"] ?? "SkillUpUsers";

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
        new Claim("userId", account.Id.ToString()),           
        new Claim("email", account.Email),                    
        new Claim("fullname", account.Fullname ?? account.Email), 
        new Claim("roleId", account.RoleId.ToString()),       
        new Claim("roleName", account.Role.Name),             
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public ClaimsPrincipal? GetPrincipalFromToken(string token)
        {
            try
            {
                var jwtSettings = _configuration.GetSection("JwtSettings");
                var secretKey = jwtSettings["SecretKey"] ?? throw new ArgumentNullException("JWT SecretKey not configured");

                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = false, // Không validate expiry để có thể refresh
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidAudience = jwtSettings["Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

                if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                    !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    return null;
                }

                return principal;
            }
            catch
            {
                return null;
            }
        }


        public string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        public bool VerifyPassword(string password, string hashedPassword)
        {
            try
            {
                return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
            }
            catch
            {
                return false;
            }
        }
    }
}
