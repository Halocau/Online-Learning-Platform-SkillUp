using Google.Apis.Auth;
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
        private readonly IOtpRepository _otpRepository;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthService(IAccountRepository accountRepository,
                            IRefreshTokenRepository refreshTokenRepository,
                            IOtpRepository otpRepository,
                             IConfiguration configuration,
                             IEmailService emailService)
        {
            _accountRepository = accountRepository;
            _refreshTokenRepository = refreshTokenRepository;
            _otpRepository = otpRepository;
            _configuration = configuration;
            _emailService = emailService;
        }

        public async Task<LoginResponseDto?> LoginAsync(LoginRequestDto request)
        {
            // Validate credentials and account status in one query
            var account = await _accountRepository.GetByEmailWithRoleAndPermissionsAsync(request.Email);
            if (account == null || !VerifyPassword(request.Password, account.Password) || account.Status != "Active")
            {
                return null;
            }

            var accessToken = GenerateAccessToken(account);
            var refreshToken = GenerateRefreshToken();
            await CreateRefreshTokenEntityAsync(account.Id, refreshToken);

            return new LoginResponseDto
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };
        }

        public async Task<RefreshTokenResponseDto?> RefreshTokenAsync(RefreshTokenRequestDto request)
        {
            // Validate expired token without checking lifetime
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

            var emailClaim = principal.Claims.FirstOrDefault(c => c.Type == "email")?.Value;
            if (string.IsNullOrEmpty(emailClaim))
            {
                return null;
            }

            var account = await _accountRepository.GetByEmailWithRoleAndPermissionsAsync(emailClaim);
            if (account == null || account.Status != "Active")
            {
                return null;
            }

            // Revoke old refresh token before issuing new one
            refreshTokenEntity.RevokedUtc = DateTime.Now;
            await _refreshTokenRepository.UpdateAsync(refreshTokenEntity);

            var newAccessToken = GenerateAccessToken(account);
            var newRefreshToken = GenerateRefreshToken();
            await CreateRefreshTokenEntityAsync(account.Id, newRefreshToken);

            return new RefreshTokenResponseDto
            {
                Tokens = new TokenDto
                {
                    AccessToken = newAccessToken,
                    RefreshToken = newRefreshToken
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

            var claims = new List<Claim>
            {
                new Claim("userId", account.Id.ToString()),
                new Claim("email", account.Email),
                new Claim("fullname", account.Fullname ?? account.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Include role and licensed permissions for authorization
            if (account.Role != null)
            {
                claims.Add(new Claim("roleId", account.Role.Id.ToString()));
                claims.Add(new Claim("roleName", account.Role.Name));

                if (account.Role.RolePermissions != null && account.Role.RolePermissions.Any())
                {
                    foreach (var rolePermission in account.Role.RolePermissions.Where(rp => rp.Licensed))
                    {
                        if (rolePermission.Permission != null)
                        {
                            claims.Add(new Claim("permission", rolePermission.Permission.ActionName));
                            claims.Add(new Claim("permissionCode", rolePermission.Permission.ActionCode));
                            claims.Add(new Claim("permissionId", rolePermission.Permission.Id.ToString()));
                        }
                    }
                }
            }

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(15),
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

        // Helper method to reduce duplicate refresh token creation code
        private async Task<RefreshToken> CreateRefreshTokenEntityAsync(Guid accountId, string token)
        {
            var refreshTokenEntity = new RefreshToken
            {
                Id = Guid.NewGuid(),
                Token = token,
                AccountId = accountId,
                CreatedUtc = DateTime.Now,
                ExpiresUtc = DateTime.Now.AddDays(7),
                RevokedUtc = null
            };

            await _refreshTokenRepository.AddAsync(refreshTokenEntity);
            await _refreshTokenRepository.SaveChangesAsync();

            return refreshTokenEntity;
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
                    ValidateLifetime = false, // Allow expired tokens for refresh flow
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

        public async Task<RegisterResponseDto?> RegisterAsync(RegisterRequestDto request)
        {
            if (await _accountRepository.ExistsByEmailAsync(request.Email))
            {
                return null;
            }

            var hashedPassword = HashPassword(request.Password);
            var verifyToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            var tokenExpiry = DateTime.Now.AddHours(24);

            // Create account in pending state until email verification
            var account = new Account
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                Password = hashedPassword,
                Fullname = request.Fullname,
                RoleId = request.RoleId,
                Status = "InActive",
                CreatedAt = DateTime.Now
            };

            await _accountRepository.AddAsync(account);

            var otp = new Otp
            {
                Id = Guid.NewGuid(),
                AccountId = account.Id,
                OtpLink = verifyToken,
                OtpExpiry = tokenExpiry,
                IsUsed = false,
                UsedAt = null
            };

            await _otpRepository.AddAsync(otp);

            // Save both entities in one transaction
            if (!await _accountRepository.SaveChangesAsync())
            {
                return null;
            }

            await _emailService.SendVerifyEmailAsync(request.Email, verifyToken, request.Fullname);

            return new RegisterResponseDto
            {
                Email = request.Email
            };
        }

        public async Task<bool> VerifyEmailAsync(VerifyEmailRequestDto request)
        {
            var account = await _accountRepository.GetByEmailAsync(request.Email);
            if (account == null)
            {
                return false;
            }

            // Already verified, return success
            if (account.Status == "Active")
            {
                return true;
            }

            var otp = await _otpRepository.GetByAccountEmailAndTokenAsync(request.Email, request.Token);
            if (otp == null || otp.IsUsed)
            {
                return false;
            }

            // Mark OTP as used for audit trail
            account.Status = "Active";
            otp.IsUsed = true;
            otp.UsedAt = DateTime.Now;

            await _accountRepository.UpdateAsync(account);
            await _otpRepository.UpdateAsync(otp);

            var saved = await _accountRepository.SaveChangesAsync();
            if (!saved)
            {
                return false;
            }

            return true;
        }

        public async Task<bool> ResendVerifyEmailAsync(ResendOtpRequestDto request)
        {
            // Only allow resend for unverified accounts
            var account = await _accountRepository.GetByEmailAsync(request.Email);
            if (account == null || account.Status != "InActive")
            {
                return false;
            }

            var verifyToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            var tokenExpiry = DateTime.Now.AddHours(24);

            var existingOtp = await _otpRepository.GetByAccountIdAsync(account.Id);

            // Update existing OTP or create new one
            if (existingOtp != null)
            {
                existingOtp.OtpLink = verifyToken;
                existingOtp.OtpExpiry = tokenExpiry;
                existingOtp.IsUsed = false;
                existingOtp.UsedAt = null;
                await _otpRepository.UpdateAsync(existingOtp);
            }
            else
            {
                var otp = new Otp
                {
                    Id = Guid.NewGuid(),
                    AccountId = account.Id,
                    OtpLink = verifyToken,
                    OtpExpiry = tokenExpiry,
                    IsUsed = false,
                    UsedAt = null
                };
                await _otpRepository.AddAsync(otp);
            }

            if (!await _otpRepository.SaveChangesAsync())
            {
                return false;
            }

            await _emailService.SendVerifyEmailAsync(request.Email, verifyToken, account.Fullname ?? request.Email);

            return true;
        }

        public async Task<GoogleLoginResponseDto?> GoogleLoginAsync(GoogleLoginRequestDto request)
        {
            try
            {
                // Verify Google ID token
                var googleClientId = _configuration["GoogleAuth:ClientId"];
                if (string.IsNullOrEmpty(googleClientId))
                {
                    throw new Exception("Google ClientId chưa được cấu hình");
                }

                var payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { googleClientId }
                });

                var email = payload.Email;
                var fullname = payload.Name;
                var avatar = payload.Picture;

                var existingAccount = await _accountRepository.GetByEmailWithRoleAndPermissionsAsync(email);

                bool isNewUser = false;
                Account account;

                // Create new account if not exists
                if (existingAccount == null)
                {
                    account = new Account
                    {
                        Id = Guid.NewGuid(),
                        Email = email,
                        Fullname = fullname,
                        Avatar = avatar,
                        Password = HashPassword(Guid.NewGuid().ToString()), // Random password for Google auth
                        Status = "Active", // Auto-activate since Google verified email
                        RoleId = request.DefaultRoleId,
                        CreatedAt = DateTime.Now
                    };

                    await _accountRepository.AddAsync(account);
                    await _accountRepository.SaveChangesAsync();

                    // Reload account with role and permissions for token generation
                    account = await _accountRepository.GetByEmailWithRoleAndPermissionsAsync(email) ?? account;

                    isNewUser = true;
                }
                else
                {
                    account = existingAccount;

                    if (account.Status == "Banned")
                    {
                        return null;
                    }

                    // Batch updates to minimize database calls
                    var needUpdate = false;

                    if (account.Status == "InActive")
                    {
                        account.Status = "Active";
                        needUpdate = true;
                    }

                    if (string.IsNullOrEmpty(account.Avatar) && !string.IsNullOrEmpty(avatar))
                    {
                        account.Avatar = avatar;
                        needUpdate = true;
                    }

                    if (needUpdate)
                    {
                        await _accountRepository.UpdateAsync(account);
                        await _accountRepository.SaveChangesAsync();
                    }
                }

                var accessToken = GenerateAccessToken(account);
                var refreshToken = GenerateRefreshToken();
                await CreateRefreshTokenEntityAsync(account.Id, refreshToken);

                return new GoogleLoginResponseDto
                {
                    UserId = account.Id,
                    Email = account.Email,
                    Fullname = account.Fullname ?? email,
                    Avatar = account.Avatar,
                    IsNewUser = isNewUser,
                    Token = new TokenDto
                    {
                        AccessToken = accessToken,
                        RefreshToken = refreshToken
                    }
                };
            }
            catch (Google.Apis.Auth.InvalidJwtException)
            {
                return null;
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}
