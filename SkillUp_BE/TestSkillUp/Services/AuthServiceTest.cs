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
        private Mock<ICartService> _iCartServiceMock = null!;
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
            _iCartServiceMock = new Mock<ICartService>(MockBehavior.Loose);

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
                _iStudentServiceMock.Object,
                _iCartServiceMock.Object
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

        // -------------------- REGISTER --------------------
        [Test]//1
        public async Task RegisterAsync_StudentRole5_Success_CreatesStudentAndSendsEmail()
        {
            // Arrange
            var request = new RegisterRequestDto
            {
                Email = "student@example.com",
                Password = "P@ssw0rd!",
                Fullname = "Student User",
                RoleId = 5
            };

            _iAccountRepositoryMock
                .Setup(r => r.ExistsByEmailAsync(request.Email))
                .ReturnsAsync(false);

            _iAccountRepositoryMock
                .Setup(r => r.AddAsync(It.IsAny<Account>()))
                .Returns(Task.CompletedTask);

            _iOtpRepositoryMock
                .Setup(r => r.AddAsync(It.IsAny<Otp>()))
                .Returns(Task.CompletedTask);

            _iAccountRepositoryMock
                .Setup(r => r.SaveChangesAsync())
                .ReturnsAsync(true);

            _iStudentServiceMock
                .Setup(s => s.RegisterStudentAsync(It.IsAny<Guid>()))
                .ReturnsAsync(true);

            // Act
            var result = await _sut.RegisterAsync(request);

            // Assert
            Assert.IsTrue(result);
            _iStudentServiceMock.Verify(s => s.RegisterStudentAsync(It.IsAny<Guid>()), Times.Once);
            _iEmailServiceMock.Verify(e =>
                e.SendVerifyEmailAsync(request.Email, It.IsAny<string>(), request.Fullname),
                Times.Once);
        }
        [Test]//1
        public async Task RegisterAsync_Role4_Success_NoStudentRegister()
        {
            // Arrange
            var request = new RegisterRequestDto
            {
                Email = "mod@example.com",
                Password = "P@ssw0rd!",
                Fullname = "Mod User",
                RoleId = 4
            };

            _iAccountRepositoryMock
                .Setup(r => r.ExistsByEmailAsync(request.Email))
                .ReturnsAsync(false);

            _iAccountRepositoryMock
                .Setup(r => r.AddAsync(It.IsAny<Account>()))
                .Returns(Task.CompletedTask);

            _iOtpRepositoryMock
                .Setup(r => r.AddAsync(It.IsAny<Otp>()))
                .Returns(Task.CompletedTask);

            _iAccountRepositoryMock
                .Setup(r => r.SaveChangesAsync())
                .ReturnsAsync(true);

            // Act
            var result = await _sut.RegisterAsync(request);

            // Assert
            Assert.IsTrue(result);
            _iStudentServiceMock.Verify(s => s.RegisterStudentAsync(It.IsAny<Guid>()), Times.Never);
            _iEmailServiceMock.Verify(e =>
                e.SendVerifyEmailAsync(request.Email, It.IsAny<string>(), request.Fullname),
                Times.Once);
        }
        [Test]//1
        public async Task RegisterAsync_EmailAlreadyExists_ReturnsFalse_AndDoesNotCreateAccount()
        {
            // Arrange
            var request = new RegisterRequestDto
            {
                Email = "dup@example.com",
                Password = "P@ssw0rd!",
                Fullname = "Dup User",
                RoleId = 4
            };

            _iAccountRepositoryMock
                .Setup(r => r.ExistsByEmailAsync(request.Email))
                .ReturnsAsync(true);

            // Act
            var result = await _sut.RegisterAsync(request);

            // Assert
            Assert.IsFalse(result);
            _iAccountRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Account>()), Times.Never);
            _iAccountRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Never);
            _iOtpRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Otp>()), Times.Never);
            _iEmailServiceMock.Verify(e => e.SendVerifyEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        // -------------------- VERIFY EMAIL --------------------

        [Test]
        public async Task VerifyEmailAsync_AccountNotFound_ReturnsFalse()
        {
            // Arrange
            var request = new VerifyEmailRequestDto
            {
                Email = "notfound@example.com",
                Token = "any-token"
            };

            _iAccountRepositoryMock
                .Setup(r => r.GetByEmailAsync(request.Email))
                .ReturnsAsync((Account?)null);

            // Act
            var result = await _sut.VerifyEmailAsync(request);

            // Assert
            Assert.IsFalse(result);
            _iOtpRepositoryMock.Verify(r => r.GetByAccountEmailAndTokenAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Test]
        public async Task VerifyEmailAsync_OtpNotFound_ReturnsFalse()
        {
            // Arrange
            var account = new Account
            {
                Id = Guid.NewGuid(),
                Email = "user@example.com",
                RoleId = 5
            };

            var request = new VerifyEmailRequestDto
            {
                Email = account.Email,
                Token = "invalid-token"
            };

            _iAccountRepositoryMock
                .Setup(r => r.GetByEmailAsync(request.Email))
                .ReturnsAsync(account);

            _iOtpRepositoryMock
                .Setup(r => r.GetByAccountEmailAndTokenAsync(request.Email, request.Token))
                .ReturnsAsync((Otp?)null);

            // Act
            var result = await _sut.VerifyEmailAsync(request);

            // Assert
            Assert.IsFalse(result);
            _iAccountRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Account>()), Times.Never);
        }

        [Test]
        public async Task VerifyEmailAsync_OtpAlreadyUsed_ReturnsFalse()
        {
            // Arrange
            var account = new Account
            {
                Id = Guid.NewGuid(),
                Email = "user@example.com",
                RoleId = 5
            };

            var otp = new Otp
            {
                Id = Guid.NewGuid(),
                AccountId = account.Id,
                OtpLink = "token",
                IsUsed = true,
                UsedAt = DateTime.Now
            };

            var request = new VerifyEmailRequestDto
            {
                Email = account.Email,
                Token = otp.OtpLink
            };

            _iAccountRepositoryMock
                .Setup(r => r.GetByEmailAsync(request.Email))
                .ReturnsAsync(account);

            _iOtpRepositoryMock
                .Setup(r => r.GetByAccountEmailAndTokenAsync(request.Email, request.Token))
                .ReturnsAsync(otp);

            // Act
            var result = await _sut.VerifyEmailAsync(request);

            // Assert
            Assert.IsFalse(result);
            _iAccountRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Account>()), Times.Never);
        }

        // -------------------- FORGOT PASSWORD --------------------

        [Test]
        public async Task ForgotPasswordAsync_AccountNotFound_ReturnsFalse()
        {
            // Arrange
            var request = new ForgotPasswordRequestDto
            {
                Email = "notfound@example.com"
            };

            _iAccountRepositoryMock
                .Setup(r => r.GetByEmailAsync(request.Email))
                .ReturnsAsync((Account?)null);

            // Act
            var result = await _sut.ForgotPasswordAsync(request);

            // Assert
            Assert.IsFalse(result);
            _iOtpRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Otp>()), Times.Never);
            _iEmailServiceMock.Verify(e => e.SendResetPasswordEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Test]
        public async Task ForgotPasswordAsync_AccountInActive_ReturnsFalse()
        {
            // Arrange
            var account = new Account
            {
                Id = Guid.NewGuid(),
                Email = "inactive@example.com",
                Status = "InActive"
            };

            var request = new ForgotPasswordRequestDto
            {
                Email = account.Email
            };

            _iAccountRepositoryMock
                .Setup(r => r.GetByEmailAsync(request.Email))
                .ReturnsAsync(account);

            // Act
            var result = await _sut.ForgotPasswordAsync(request);

            // Assert
            Assert.IsFalse(result);
            _iOtpRepositoryMock.Verify(r => r.AddAsync(It.IsAny<Otp>()), Times.Never);
            _iEmailServiceMock.Verify(e => e.SendResetPasswordEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Test]
        public async Task ForgotPasswordAsync_PendingAccount_SaveChangesSuccess_ReturnsTrue_AndSendsEmail()
        {
            // Arrange
            var account = new Account
            {
                Id = Guid.NewGuid(),
                Email = "pending@example.com",
                Fullname = "Pending User",
                Status = "Pending"
            };

            var request = new ForgotPasswordRequestDto
            {
                Email = account.Email
            };

            _iAccountRepositoryMock
                .Setup(r => r.GetByEmailAsync(request.Email))
                .ReturnsAsync(account);

            _iOtpRepositoryMock
                .Setup(r => r.AddAsync(It.IsAny<Otp>()))
                .Returns(Task.CompletedTask);

            _iOtpRepositoryMock
                .Setup(r => r.SaveChangesAsync())
                .ReturnsAsync(true);

            // Act
            var result = await _sut.ForgotPasswordAsync(request);

            // Assert
            Assert.IsTrue(result);
            _iOtpRepositoryMock.Verify(r => r.AddAsync(It.Is<Otp>(o => 
                o.AccountId == account.Id && 
                o.OtpLink.StartsWith("RPW_") && 
                o.IsUsed == false)), Times.Once);
            _iOtpRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
            _iEmailServiceMock.Verify(e => e.SendResetPasswordEmailAsync(
                request.Email,
                It.Is<string>(token => token.StartsWith("RPW_")),
                account.Fullname),
                Times.Once);
        }

        [Test]
        public async Task ForgotPasswordAsync_ActiveAccount_SaveChangesSuccess_ReturnsTrue_AndSendsEmail()
        {
            // Arrange
            var account = new Account
            {
                Id = Guid.NewGuid(),
                Email = "active@example.com",
                Fullname = "Active User",
                Status = "Active"
            };

            var request = new ForgotPasswordRequestDto
            {
                Email = account.Email
            };

            _iAccountRepositoryMock
                .Setup(r => r.GetByEmailAsync(request.Email))
                .ReturnsAsync(account);

            _iOtpRepositoryMock
                .Setup(r => r.AddAsync(It.IsAny<Otp>()))
                .Returns(Task.CompletedTask);

            _iOtpRepositoryMock
                .Setup(r => r.SaveChangesAsync())
                .ReturnsAsync(true);

            // Act
            var result = await _sut.ForgotPasswordAsync(request);

            // Assert
            Assert.IsTrue(result);
            _iOtpRepositoryMock.Verify(r => r.AddAsync(It.Is<Otp>(o => 
                o.AccountId == account.Id && 
                o.OtpLink.StartsWith("RPW_") && 
                o.IsUsed == false)), Times.Once);
            _iOtpRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
            _iEmailServiceMock.Verify(e => e.SendResetPasswordEmailAsync(
                request.Email,
                It.Is<string>(token => token.StartsWith("RPW_")),
                account.Fullname),
                Times.Once);
        }

        // -------------------- RESET PASSWORD --------------------

        [Test]
        public async Task ResetPasswordAsync_EmailEmpty_ReturnsFalse()
        {
            // Arrange
            var request = new ResetPasswordRequestDto
            {
                Email = "",
                Token = "RPW_token",
                NewPassword = "NewP@ssw0rd!"
            };

            // Act
            var result = await _sut.ResetPasswordAsync(request);

            // Assert
            Assert.IsFalse(result);
            _iAccountRepositoryMock.Verify(r => r.GetByEmailAsync(It.IsAny<string>()), Times.Never);
        }

        [Test]
        public async Task ResetPasswordAsync_TokenEmpty_ReturnsFalse()
        {
            // Arrange
            var request = new ResetPasswordRequestDto
            {
                Email = "user@example.com",
                Token = "",
                NewPassword = "NewP@ssw0rd!"
            };

            // Act
            var result = await _sut.ResetPasswordAsync(request);

            // Assert
            Assert.IsFalse(result);
            _iAccountRepositoryMock.Verify(r => r.GetByEmailAsync(It.IsAny<string>()), Times.Never);
        }

        [Test]
        public async Task ResetPasswordAsync_NewPasswordEmpty_ReturnsFalse()
        {
            // Arrange
            var request = new ResetPasswordRequestDto
            {
                Email = "user@example.com",
                Token = "RPW_token",
                NewPassword = ""
            };

            // Act
            var result = await _sut.ResetPasswordAsync(request);

            // Assert
            Assert.IsFalse(result);
            _iAccountRepositoryMock.Verify(r => r.GetByEmailAsync(It.IsAny<string>()), Times.Never);
        }

        [Test]
        public async Task ResetPasswordAsync_AccountNotFound_ReturnsFalse()
        {
            // Arrange
            var request = new ResetPasswordRequestDto
            {
                Email = "notfound@example.com",
                Token = "RPW_token",
                NewPassword = "NewP@ssw0rd!"
            };

            _iAccountRepositoryMock
                .Setup(r => r.GetByEmailAsync(request.Email))
                .ReturnsAsync((Account?)null);

            // Act
            var result = await _sut.ResetPasswordAsync(request);

            // Assert
            Assert.IsFalse(result);
            _iOtpRepositoryMock.Verify(r => r.GetByAccountEmailAndTokenAsync(It.IsAny<string>(), It.IsAny<string>()), Times.Never);
        }

        [Test]
        public async Task ResetPasswordAsync_OtpNotFound_ReturnsFalse()
        {
            // Arrange
            var account = new Account
            {
                Id = Guid.NewGuid(),
                Email = "user@example.com",
                Password = "old-hash"
            };

            var request = new ResetPasswordRequestDto
            {
                Email = account.Email,
                Token = "RPW_invalid-token",
                NewPassword = "NewP@ssw0rd!"
            };

            _iAccountRepositoryMock
                .Setup(r => r.GetByEmailAsync(request.Email))
                .ReturnsAsync(account);

            _iOtpRepositoryMock
                .Setup(r => r.GetByAccountEmailAndTokenAsync(request.Email, request.Token))
                .ReturnsAsync((Otp?)null);

            // Act
            var result = await _sut.ResetPasswordAsync(request);

            // Assert
            Assert.IsFalse(result);
            _iAccountRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Account>()), Times.Never);
        }

        [Test]
        public async Task ResetPasswordAsync_ValidRequest_Success_ReturnsTrue()
        {
            // Arrange
            var account = new Account
            {
                Id = Guid.NewGuid(),
                Email = "user@example.com",
                Password = "old-hash"
            };

            var otp = new Otp
            {
                Id = Guid.NewGuid(),
                AccountId = account.Id,
                OtpLink = "RPW_valid-token",
                IsUsed = false,
                OtpExpiry = DateTime.Now.AddHours(1)
            };

            var request = new ResetPasswordRequestDto
            {
                Email = account.Email,
                Token = otp.OtpLink,
                NewPassword = "NewP@ssw0rd!"
            };

            _iAccountRepositoryMock
                .Setup(r => r.GetByEmailAsync(request.Email))
                .ReturnsAsync(account);

            _iOtpRepositoryMock
                .Setup(r => r.GetByAccountEmailAndTokenAsync(request.Email, request.Token))
                .ReturnsAsync(otp);

            _iAccountRepositoryMock
                .Setup(r => r.UpdateAsync(It.IsAny<Account>()))
                .Returns(Task.CompletedTask);

            _iOtpRepositoryMock
                .Setup(r => r.UpdateAsync(It.IsAny<Otp>()))
                .Returns(Task.CompletedTask);

            _iRefreshTokenRepositoryMock
                .Setup(r => r.RevokeAllUserTokensAsync(account.Id))
                .Returns(Task.CompletedTask);

            _iAccountRepositoryMock
                .Setup(r => r.SaveChangesAsync())
                .ReturnsAsync(true);

            // Act
            var result = await _sut.ResetPasswordAsync(request);

            // Assert
            Assert.IsTrue(result);
        }

        // -------------------- GOOGLE LOGIN --------------------

        [Test]
        public async Task GoogleLoginAsync_RequestNull_ReturnsNull()
        {
            // Act
            var result = await _sut.GoogleLoginAsync(null!);

            // Assert
            Assert.IsNull(result);
        }

        [Test]
        public async Task GoogleLoginAsync_IdTokenEmpty_ReturnsNull()
        {
            // Arrange
            var request = new GoogleLoginRequestDto
            {
                IdToken = "",
                DefaultRoleId = 5
            };

            // Act
            var result = await _sut.GoogleLoginAsync(request);

            // Assert
            Assert.IsNull(result);
        }


        [Test]
        public async Task GoogleLoginAsync_GoogleClientIdNotConfigured_ReturnsNull()
        {
            // Arrange - Configuration không có GoogleAuth:ClientId
            var request = new GoogleLoginRequestDto
            {
                IdToken = "valid-token",
                DefaultRoleId = 5
            };

            // Act
            var result = await _sut.GoogleLoginAsync(request);

            // Assert
            Assert.IsNull(result);
        }

    }
      
}
