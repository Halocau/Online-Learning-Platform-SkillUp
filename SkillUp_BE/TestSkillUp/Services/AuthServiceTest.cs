using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Moq;
using NUnit.Framework;
using SkillUp.BussinessObjects.DTOs.Auth;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
// Alias để gọi đúng implementation AuthService thật, tránh đụng tên lớp trong test
using AuthSvc = SkillUp.Services.Implementations.AuthService;

namespace TestSkillUp
{
    [TestFixture]
    public class AuthServiceTests
    {
        private Mock<IAccountRepository> _iAccountRepositoryMock = null!;
        private Mock<IRefreshTokenRepository> _iRefreshTokenRepositoryMock = null!;
        private Mock<IOtpRepository> _iOtpRepositoryMock = null!;
        private Mock<IEmailService> _iEmailServiceMock = null!;
        private Mock<IStudentService> _iStudentServiceMock = null!;
        private IConfiguration _configuration = null!;
        private IAuthService _sut = null!; // System Under Test

        [SetUp]
        public void SetUp()
        {
            // Strict cho những mock sẽ Verify cụ thể; Loose cho phần chưa dùng trong nhóm test này
            _iAccountRepositoryMock = new Mock<IAccountRepository>(MockBehavior.Strict);
            _iRefreshTokenRepositoryMock = new Mock<IRefreshTokenRepository>(MockBehavior.Strict);
            _iOtpRepositoryMock = new Mock<IOtpRepository>(MockBehavior.Loose);
            _iEmailServiceMock = new Mock<IEmailService>(MockBehavior.Loose);
            _iStudentServiceMock = new Mock<IStudentService>(MockBehavior.Loose);

            // IConfiguration thật để hàm GenerateAccessToken() tạo JWT hợp lệ
            var dict = new Dictionary<string, string?>
            {
                ["JwtSettings:SecretKey"] = "THIS_IS_A_DEMO_SECRET_KEY_32+CHARS", // khóa ký JWT (test)
                ["JwtSettings:Issuer"] = "SkillUp",
                ["JwtSettings:Audience"] = "SkillUpUsers"
            };
            _configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(dict!)
                .Build();

            // Khởi tạo AuthService thật với các mock
            _sut = new AuthSvc(
                _iAccountRepositoryMock.Object,
                _iRefreshTokenRepositoryMock.Object,
                _iOtpRepositoryMock.Object,
                _configuration,
                _iEmailServiceMock.Object,
                _iStudentServiceMock.Object
            );
        }

        // -------------------- LOGIN --------------------

        [Test]
        public async Task LoginAsync_ActiveAccount_CorrectPassword_ReturnsTokens_AndPersistsRefreshToken()
        {
            // Arrange
            // BCrypt hash trước để VerifyPassword(password, hashed) trong service trả true
            var plain = "P@ssw0rd!";
            var hashed = BCrypt.Net.BCrypt.HashPassword(plain);

            var account = new Account
            {
                Id = Guid.NewGuid(),
                Email = "user@example.com",
                Password = hashed,       
                Fullname = "Skill Up",
                Status = "Active",     
                RoleId = 5,
                Role = null // Không cần mock Role/Permissions trong test này
            };

            // Repo trả về account hợp lệ
            _iAccountRepositoryMock
                .Setup(r => r.GetByEmailWithRoleAndPermissionsAsync(account.Email))
                .ReturnsAsync(account);

            // Lưu refresh token (Add + SaveChanges) phải được gọi
            _iRefreshTokenRepositoryMock
                .Setup(r => r.AddAsync(It.IsAny<RefreshToken>()))
                .Returns(Task.CompletedTask);

            _iRefreshTokenRepositoryMock
                .Setup(r => r.SaveChangesAsync())
                .ReturnsAsync(true);

            var req = new LoginRequestDto { Email = account.Email, Password = plain };

            // Act
            var res = await _sut.LoginAsync(req);

            // Assert
            Assert.IsNotNull(res);
            Assert.False(string.IsNullOrWhiteSpace(res!.AccessToken));
            Assert.False(string.IsNullOrWhiteSpace(res.RefreshToken));
            // Kiểm tra hình dạng JWT: phải có 3 phần x.y.z
            Assert.That(res.AccessToken.Count(c => c == '.'), Is.EqualTo(2));

            // Kiểm tra repo bị gọi đúng
            _iAccountRepositoryMock.Verify(r => r.GetByEmailWithRoleAndPermissionsAsync(account.Email), Times.Once);

            // Verify refresh token được tạo đúng user, có hạn dùng > now, và đã SaveChanges
            _iRefreshTokenRepositoryMock.Verify(r => r.AddAsync(It.Is<RefreshToken>(t =>
                t.AccountId == account.Id &&
                t.Token == res.RefreshToken &&
                t.ExpiresUtc > DateTime.Now
            )), Times.Once);

            _iRefreshTokenRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Test]//1
        public async Task LoginAsync_WrongPassword_ReturnsNull()
        {
            // Arrange
            var account = new Account
            {
                Id = Guid.NewGuid(),
                Email = "user@example.com",
                Password = BCrypt.Net.BCrypt.HashPassword("correct-password"),
                Status = "Active"
            };

            _iAccountRepositoryMock
                .Setup(r => r.GetByEmailWithRoleAndPermissionsAsync(account.Email))
                .ReturnsAsync(account);

            var request = new LoginRequestDto
            {
                Email = account.Email,
                Password = "wrong-password"
            };

            // Act
            var result = await _sut.LoginAsync(request);

            // Assert
            Assert.IsNull(result);
        }

        [Test]
        public async Task LoginAsync_StatusPending()
        {
            // Arrange: account Pending nhưng service hiện tại KHÔNG chặn, nên hành vi như Active
            var plain = "ok";
            var hashed = BCrypt.Net.BCrypt.HashPassword(plain);

            var account = new Account
            {
                Id = Guid.NewGuid(),
                Email = "pending@ex.com",
                Password = hashed,
                Status = "Pending"
            };

            _iAccountRepositoryMock
                .Setup(r => r.GetByEmailWithRoleAndPermissionsAsync(account.Email))
                .ReturnsAsync(account);

            _iRefreshTokenRepositoryMock
                .Setup(r => r.AddAsync(It.IsAny<RefreshToken>()))
                .Returns(Task.CompletedTask);

            _iRefreshTokenRepositoryMock
                .Setup(r => r.SaveChangesAsync())
                .ReturnsAsync(true);

            var req = new LoginRequestDto
            {
                Email = account.Email,
                Password = plain
            };

            // Act
            var res = await _sut.LoginAsync(req);

            // Assert
            Assert.IsNotNull(res);
            Assert.False(string.IsNullOrWhiteSpace(res!.AccessToken));
            Assert.False(string.IsNullOrWhiteSpace(res.RefreshToken));

            _iAccountRepositoryMock.Verify(r => r.GetByEmailWithRoleAndPermissionsAsync(account.Email), Times.Once);
            _iRefreshTokenRepositoryMock.Verify(r => r.AddAsync(It.IsAny<RefreshToken>()), Times.Once);
            _iRefreshTokenRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Test]//1
        public async Task LoginAsync_AccountNotFound_ReturnsNull_AndDoesNotTouchRefreshRepo()
        {
            // Arrange: không tìm thấy account
            _iAccountRepositoryMock
                .Setup(r => r.GetByEmailWithRoleAndPermissionsAsync("no@ex.com"))
                .ReturnsAsync((Account?)null);

            // Act
            var res = await _sut.LoginAsync(new LoginRequestDto { Email = "no@ex.com", Password = "x" });

            // Assert
            Assert.IsNull(res);
            // Không được phép đụng refresh token repo
            _iRefreshTokenRepositoryMock.Verify(r => r.AddAsync(It.IsAny<RefreshToken>()), Times.Never);
            _iRefreshTokenRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Never);
        }

        [Test]//1
        public void LoginAsync_StatusInActive_Throws()
        {
            // Arrange: account InActive => phải ném Exception với message tương ứng
            var account = new Account
            {
                Id = Guid.NewGuid(),
                Email = "inactive@ex.com",
                Password = BCrypt.Net.BCrypt.HashPassword("ok"),
                Status = "InActive"
            };

            _iAccountRepositoryMock
                .Setup(r => r.GetByEmailWithRoleAndPermissionsAsync(account.Email))
                .ReturnsAsync(account);

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() => _sut.LoginAsync(new LoginRequestDto
            {
                Email = account.Email,
                Password = "ok"
            }));

            // Kiểm tra thông báo đúng
            StringAssert.Contains("chưa được kích hoạt", ex!.Message);
            // Không được tạo refresh token
            _iRefreshTokenRepositoryMock.Verify(r => r.AddAsync(It.IsAny<RefreshToken>()), Times.Never);
        }

        [Test]//1
        public void LoginAsync_StatusBanned_Throws()
        {
            // Arrange: account Banned => phải ném Exception với message tương ứng
            var account = new Account
            {
                Id = Guid.NewGuid(),
                Email = "ban@ex.com",
                Password = BCrypt.Net.BCrypt.HashPassword("ok"),
                Status = "Banned"
            };

            _iAccountRepositoryMock
                .Setup(r => r.GetByEmailWithRoleAndPermissionsAsync(account.Email))
                .ReturnsAsync(account);

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() => _sut.LoginAsync(new LoginRequestDto
            {
                Email = account.Email,
                Password = "ok"
            }));

            StringAssert.Contains("đã bị cấm", ex!.Message);
            _iRefreshTokenRepositoryMock.Verify(r => r.AddAsync(It.IsAny<RefreshToken>()), Times.Never);
        }

        // -------------------- REFRESH TOKEN --------------------

        [Test]
        public async Task RefreshTokenAsync_Valid_ReturnsNewTokens_AndRevokesOld()
        {
            // Arrange: tạo account Active
            var account = new Account
            {
                Id = Guid.NewGuid(),
                Email = "refresh@ex.com",
                Password = BCrypt.Net.BCrypt.HashPassword("ok"),
                Status = "Active"
            };

            // Sẽ được service gọi lại bằng email lấy từ claims trong AccessToken
            _iAccountRepositoryMock
                .Setup(r => r.GetByEmailWithRoleAndPermissionsAsync(account.Email))
                .ReturnsAsync(account);

            // Tạo access token hợp lệ (dùng chính service thật để có claims đúng)
            var accessToken = ((AuthSvc)_sut).GenerateAccessToken(account);

            // Repo xác thực refresh token cũ OK
            var old = new RefreshToken
            {
                Id = Guid.NewGuid(),
                AccountId = account.Id,
                Token = "old.rt",
                CreatedUtc = DateTime.Now.AddDays(-1),
                ExpiresUtc = DateTime.Now.AddDays(6),
                RevokedUtc = null
            };

            _iRefreshTokenRepositoryMock
                .Setup(r => r.GetValidTokenByUserIdAsync(account.Id, "old.rt"))
                .ReturnsAsync(old);

            // Revoked token cũ
            _iRefreshTokenRepositoryMock
                .Setup(r => r.UpdateAsync(It.Is<RefreshToken>(t => t.Id == old.Id)))
                .Returns(Task.CompletedTask);

            // Lưu token mới
            _iRefreshTokenRepositoryMock
                .Setup(r => r.AddAsync(It.IsAny<RefreshToken>()))
                .Returns(Task.CompletedTask);

            _iRefreshTokenRepositoryMock
                .Setup(r => r.SaveChangesAsync())
                .ReturnsAsync(true);

            var req = new RefreshTokenRequestDto
            {
                AccessToken = accessToken, // access token hết hạn vẫn parse được claims do ValidateLifetime=false
                RefreshToken = "old.rt"
            };

            // Act
            var res = await _sut.RefreshTokenAsync(req);

            // Assert
            Assert.IsNotNull(res);
            Assert.IsNotNull(res!.Tokens);
            Assert.IsFalse(string.IsNullOrWhiteSpace(res.Tokens!.AccessToken));
            Assert.IsFalse(string.IsNullOrWhiteSpace(res.Tokens.RefreshToken));

            // Old refresh token phải bị revoke (có RevokedUtc)
            _iRefreshTokenRepositoryMock.Verify(r =>
                r.UpdateAsync(It.Is<RefreshToken>(t => t.Id == old.Id && t.RevokedUtc != null)), Times.Once);

            // Refresh token mới phải được lưu cho đúng user
            _iRefreshTokenRepositoryMock.Verify(r =>
                r.AddAsync(It.Is<RefreshToken>(t => t.AccountId == account.Id && t.Token == res.Tokens.RefreshToken)), Times.Once);

            _iRefreshTokenRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.AtLeastOnce);
        }

        [Test]
        public async Task RefreshTokenAsync_InvalidAccessToken_ReturnsNull()
        {
            // Arrange: AccessToken rác -> GetPrincipalFromToken trả null
            var req = new RefreshTokenRequestDto
            {
                AccessToken = "not-a-valid-jwt",
                RefreshToken = "anything"
            };

            // Act
            var res = await _sut.RefreshTokenAsync(req);

            // Assert
            Assert.IsNull(res);
        }

        // -------------------- LOGOUT --------------------

        [Test]
        public async Task LogoutAsync_RevokesAllTokens_AndReturnsTrueWhenSaveSucceeds()
        {
            // Arrange
            var userId = Guid.NewGuid();

            _iRefreshTokenRepositoryMock
                .Setup(r => r.RevokeAllUserTokensAsync(userId))
                .Returns(Task.CompletedTask);

            _iRefreshTokenRepositoryMock
                .Setup(r => r.SaveChangesAsync())
                .ReturnsAsync(true);

            // Act
            var result = await _sut.LogoutAsync(userId);

            // Assert
            Assert.IsTrue(result);
            _iRefreshTokenRepositoryMock.Verify(r => r.RevokeAllUserTokensAsync(userId), Times.Once);
            _iRefreshTokenRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }
    }
}
