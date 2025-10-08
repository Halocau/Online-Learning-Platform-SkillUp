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
            var account = await _accountRepository.GetByEmailWithRoleAndPermissionsAsync(request.Email);
            if (account == null || !VerifyPassword(request.Password, account.Password) || account.Status != "Active")
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

            var account = await _accountRepository.GetByEmailWithRoleAndPermissionsAsync(emailClaim);
            if (account == null || account.Status != "Active")
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

            var claims = new List<Claim>
            {
                new Claim("userId", account.Id.ToString()),
                new Claim("email", account.Email),
                new Claim("fullname", account.Fullname ?? account.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            // Add role and permissions as claims
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

        public async Task<RegisterResponseDto?> RegisterAsync(RegisterRequestDto request)
        {
            // Check if email already exists
            if (await _accountRepository.ExistsByEmailAsync(request.Email))
            {
                return null;
            }

            // Hash password
            var hashedPassword = HashPassword(request.Password);

            // Generate secure verify token (32 bytes = 64 hex characters)
            var verifyToken = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
            var tokenExpiry = DateTime.UtcNow.AddHours(24); // 24 hours expiry

            // Create account
            var account = new Account
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                Password = hashedPassword,
                Fullname = request.Fullname,
                RoleId = request.RoleId,
                Status = "InActive", // Pending verification
                CreatedAt = DateTime.UtcNow
            };

            await _accountRepository.AddAsync(account);

            // Create OTP record
            var otp = new Otp
            {
                Id = Guid.NewGuid(),
                AccountId = account.Id,
                OtpLink = verifyToken,
                OtpExpiry = tokenExpiry
            };

            await _otpRepository.AddAsync(otp);

            // Save both Account and OTP together
            if (!await _accountRepository.SaveChangesAsync())
            {
                return null;
            }

            // Send verify email with link
            await _emailService.SendVerifyEmailAsync(request.Email, verifyToken, request.Fullname);

            return new RegisterResponseDto
            {
                Email = request.Email
            };
        }

        public async Task<bool> VerifyEmailAsync(VerifyEmailRequestDto request)
        {
            Console.WriteLine($"[VerifyEmailAsync] START - Email: {request.Email}, Token: {request.Token}");

            // Get account
            var account = await _accountRepository.GetByEmailAsync(request.Email);
            if (account == null)
            {
                Console.WriteLine("[VerifyEmailAsync] Account NOT FOUND");
                return false;
            }

            Console.WriteLine($"[VerifyEmailAsync] Account found - Status: {account.Status}");

            // If account is already active, return success (no need to verify again)
            if (account.Status == "Active")
            {
                Console.WriteLine("[VerifyEmailAsync] Account ALREADY ACTIVE - Returning TRUE");
                return true; //  Already verified - this is success
            }

            // Get OTP record with valid token
            var otp = await _otpRepository.GetByAccountEmailAndTokenAsync(request.Email, request.Token);
            if (otp == null)
            {
                Console.WriteLine("[VerifyEmailAsync] OTP NOT FOUND or EXPIRED");
                return false; // Invalid or expired token
            }

            Console.WriteLine($"[VerifyEmailAsync] OTP found - Id: {otp.Id}, Expiry: {otp.OtpExpiry}");

            // Activate account
            account.Status = "Active";
            await _accountRepository.UpdateAsync(account);

            // Delete OTP record
            await _otpRepository.DeleteAsync(otp);

            // Save changes (both use same DbContext, so only need to save once)
            var saved = await _accountRepository.SaveChangesAsync();

            Console.WriteLine($"[VerifyEmailAsync] Save result: {saved}");

            if (!saved)
            {
                Console.WriteLine("[VerifyEmailAsync] SAVE FAILED");
                return false;
            }

            Console.WriteLine("[VerifyEmailAsync] SUCCESS - Returning TRUE");
            return true;
        }

        public async Task<bool> ResendVerifyEmailAsync(ResendOtpRequestDto request)
        {
            // Get account by email
            var account = await _accountRepository.GetByEmailAsync(request.Email);
            if (account == null)
            {
                return false;
            }

            // Check if account is not activated yet
            if (account.Status != "InActive")
            {
                return false;
            }

            // Generate new verify token (32 bytes = 64 hex characters)
            var verifyToken = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
            var tokenExpiry = DateTime.UtcNow.AddHours(24); // 24 hours expiry

            // Get existing OTP record
            var existingOtp = await _otpRepository.GetByAccountIdAsync(account.Id);

            if (existingOtp != null)
            {
                // Update existing OTP
                existingOtp.OtpLink = verifyToken;
                existingOtp.OtpExpiry = tokenExpiry;
                await _otpRepository.UpdateAsync(existingOtp);
            }
            else
            {
                // Create new OTP record
                var otp = new Otp
                {
                    Id = Guid.NewGuid(),
                    AccountId = account.Id,
                    OtpLink = verifyToken,
                    OtpExpiry = tokenExpiry
                };
                await _otpRepository.AddAsync(otp);
            }

            if (!await _otpRepository.SaveChangesAsync())
            {
                return false;
            }

            // Send verify email with link
            await _emailService.SendVerifyEmailAsync(request.Email, verifyToken, account.Fullname ?? request.Email);

            return true;
        }
    }
}
