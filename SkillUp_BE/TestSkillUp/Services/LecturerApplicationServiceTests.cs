using Microsoft.AspNetCore.Http;
using Moq;
using NUnit.Framework;
using SkillUp.BussinessObjects.DTOs.Lecturer;
using SkillUp.BussinessObjects.DTOs.LecturerApplication;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;
using SkillUp.Services.Implementations;
using SkillUp.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TestSkillUp
{
    [TestFixture]
    public class LecturerApplicationServiceTests
    {
        private Mock<ILecturerApplicationRepository> _appRepo = null!;
        private Mock<IAccountRepository> _accountRepo = null!;
        private Mock<ICloudinaryService> _cloudinary = null!;
        private Mock<ICurrentUserService> _currentUser = null!;
        private Mock<ILecturerService> _lecturerService = null!;
        private Mock<IEmailService> _emailService = null!;

        private LecturerApplicationService _sut = null!;

        [SetUp]
        public void SetUp()
        {
            _appRepo = new Mock<ILecturerApplicationRepository>(MockBehavior.Strict);
            _accountRepo = new Mock<IAccountRepository>(MockBehavior.Strict);
            _cloudinary = new Mock<ICloudinaryService>(MockBehavior.Strict);
            _currentUser = new Mock<ICurrentUserService>(MockBehavior.Loose);
            _lecturerService = new Mock<ILecturerService>(MockBehavior.Strict);
            _emailService = new Mock<IEmailService>(MockBehavior.Loose);

            _sut = new LecturerApplicationService(
                _appRepo.Object,
                _accountRepo.Object,
                _cloudinary.Object,
                _currentUser.Object,
                _lecturerService.Object,
                _emailService.Object
            );
        }
        private static IFormFile CreateFormFile(string fileName = "file.txt", string content = "test")
        {
            var bytes = System.Text.Encoding.UTF8.GetBytes(content);
            var stream = new MemoryStream(bytes);
            return new FormFile(stream, 0, bytes.Length, "file", fileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = "application/octet-stream"
            };
        }

        //method : ApplyCvAsync 
        [Test]
        public async Task ApplyCvAsync_ReturnsTrue_WhenAccountIsLecturer_AndSaveSucceeds()
        {
            var accountId = Guid.NewGuid();

            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 4, Status = "Pending" });

            var mockCvFile = CreateFormFile("cv.pdf", "cv-content");
            var mockDegreeFile = CreateFormFile("degree.jpg", "degree-content");

            _cloudinary.Setup(c => c.UploadPdfAsync(It.IsAny<IFormFile>(), "skillup/lecturers/cv"))
                        .ReturnsAsync("https://cloudinary.com/cv.pdf");

            _cloudinary.Setup(c => c.UploadImageAsync(It.IsAny<IFormFile>(), "skillup/lecturers/degrees"))
                        .ReturnsAsync("https://cloudinary.com/degree.jpg");

            _appRepo.Setup(r => r.AddAsync(It.IsAny<LecturerApplication>()))
                    .ReturnsAsync((LecturerApplication a) => a);

            _appRepo.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            var req = new ApplyCvRequestDto
            {
                CvFile = mockCvFile,
                DegreeFile = new List<IFormFile> { mockDegreeFile },
                Description = "desc",
                Title = "title",
                Profession = "prof"
            };

            var result = await _sut.ApplyCvAsync(accountId, req);

            Assert.IsTrue(result);

            _accountRepo.Verify(r => r.GetByIdAsync(accountId), Times.Once);
            _cloudinary.Verify(c => c.UploadPdfAsync(It.IsAny<IFormFile>(), "skillup/lecturers/cv"), Times.Once);
            _cloudinary.Verify(c => c.UploadImageAsync(It.IsAny<IFormFile>(), "skillup/lecturers/degrees"), Times.Once);
            _appRepo.Verify(r => r.AddAsync(It.IsAny<LecturerApplication>()), Times.Once);
            _appRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Test]
        public async Task ApplyCvAsync_ReturnsFalse_WhenAccountDoesNotExist()
        {
            var accountId = Guid.NewGuid();

            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync((Account)null);

            var mockCvFile = CreateFormFile();
            var mockDegreeFile = CreateFormFile();

            var req = new ApplyCvRequestDto
            {
                CvFile = mockCvFile,
                DegreeFile = new List<IFormFile> { mockDegreeFile },
                Description = "desc",
                Title = "title",
                Profession = "prof"
            };

            var result = await _sut.ApplyCvAsync(accountId, req);

            Assert.IsFalse(result);

            _accountRepo.Verify(r => r.GetByIdAsync(accountId), Times.Once);

            _cloudinary.VerifyNoOtherCalls();
            _appRepo.VerifyNoOtherCalls();
        }

        [Test]
        public async Task ApplyCvAsync_ReturnsFalse_WhenAccountIsNotLecturer()
        {
            var accountId = Guid.NewGuid();
            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 2, Status = "Active" });

            var mockCvFile = CreateFormFile();
            var mockDegreeFile = CreateFormFile();

            var req = new ApplyCvRequestDto
            {
                CvFile = mockCvFile,
                DegreeFile = new List<IFormFile> { mockDegreeFile },
                Description = "desc",
                Title = "title",
                Profession = "prof"
            };

            var result = await _sut.ApplyCvAsync(accountId, req);

            Assert.IsFalse(result);

            _accountRepo.Verify(r => r.GetByIdAsync(accountId), Times.Once);
            _cloudinary.VerifyNoOtherCalls();
            _appRepo.VerifyNoOtherCalls();
        }

        [Test]
        public async Task ApplyCvAsync_ThrowsException_WhenCvFileIsNull()
        {
            var accountId = Guid.NewGuid();

            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 4, Status = "Pending" });

            var mockDegreeFile = CreateFormFile("degree.jpg", "degree-content");

            var req = new ApplyCvRequestDto
            {
                CvFile = null,
                DegreeFile = new List<IFormFile> { mockDegreeFile },
                Description = "desc",
                Title = "title",
                Profession = "prof"
            };
            Assert.ThrowsAsync<ArgumentException>(async () =>
                await _sut.ApplyCvAsync(accountId, req)
            );

            _accountRepo.Verify(r => r.GetByIdAsync(accountId), Times.Once);
            _cloudinary.VerifyNoOtherCalls();
            _appRepo.VerifyNoOtherCalls();
        }

        [Test]
        public async Task ApplyCvAsync_ThrowsException_WhenDegreeFileIsNull()
        {
            var accountId = Guid.NewGuid();

            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 4, Status = "Pending" });

            var req = new ApplyCvRequestDto
            {
                CvFile = CreateFormFile("cv.pdf", "cv-content"),
                DegreeFile = null,
                Description = "desc",
                Title = "title",
                Profession = "prof"
            };

            Assert.ThrowsAsync<ArgumentException>(async () =>
                await _sut.ApplyCvAsync(accountId, req)
            );

            _accountRepo.Verify(r => r.GetByIdAsync(accountId), Times.Once);
            _cloudinary.VerifyNoOtherCalls();
            _appRepo.VerifyNoOtherCalls();
        }    

        [Test]
        public async Task ApplyCvAsync_ReturnsTrue_WhenMultipleDegreeFilesProvided()
        {
            var accountId = Guid.NewGuid();

            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 4, Status = "Pending" });

            var mockCvFile = CreateFormFile("cv.pdf", "cv-content");

            var degreeFiles = new List<IFormFile>();
            for (int i = 0; i < 10; i++)
            {
                degreeFiles.Add(CreateFormFile($"deg{i + 1}.jpg", $"content{i + 1}"));
            }

            _cloudinary.Setup(c => c.UploadPdfAsync(It.IsAny<IFormFile>(), "skillup/lecturers/cv"))
                        .ReturnsAsync("https://cloudinary.com/cv.pdf");
            _cloudinary.Setup(c => c.UploadImageAsync(It.IsAny<IFormFile>(), "skillup/lecturers/degrees"))
                        .ReturnsAsync("https://cloudinary.com/degree.jpg");

            _appRepo.Setup(r => r.AddAsync(It.IsAny<LecturerApplication>()))
                    .ReturnsAsync((LecturerApplication a) => a);

            _appRepo.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            var req = new ApplyCvRequestDto
            {
                CvFile = mockCvFile,
                DegreeFile = degreeFiles,
                Description = "desc",
                Title = "title",
                Profession = "prof"
            };

            var result = await _sut.ApplyCvAsync(accountId, req);

            Assert.IsTrue(result);

            _accountRepo.Verify(r => r.GetByIdAsync(accountId), Times.Once);
            _cloudinary.Verify(c => c.UploadPdfAsync(It.IsAny<IFormFile>(), "skillup/lecturers/cv"), Times.Once);
            _cloudinary.Verify(c => c.UploadImageAsync(It.IsAny<IFormFile>(), "skillup/lecturers/degrees"), Times.Exactly(10));
            _appRepo.Verify(r => r.AddAsync(It.IsAny<LecturerApplication>()), Times.Once);
            _appRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        //method : GetMyApplicationsAsync 
        [Test]
        public async Task ThrowsUnauthorizedAccessException_WhenAccountNotExist()
        {
            var accountId = Guid.NewGuid();
            _accountRepo.Setup(r => r.GetByIdAsync(accountId)).ReturnsAsync((Account)null);

            Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                await _sut.GetMyApplicationsAsync(accountId)
            );

            _accountRepo.Verify(r => r.GetByIdAsync(accountId), Times.Once);
        }
        [Test]
        public async Task ThrowsUnauthorizedAccessException_WhenAccountIsNotLecturer()
        {
            var accountId = Guid.NewGuid();
            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 2 });

            Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
                await _sut.GetMyApplicationsAsync(accountId)
            );

            _accountRepo.Verify(r => r.GetByIdAsync(accountId), Times.Once);
        }
        [Test]
        public async Task ReturnsEmptyList_WhenNoApplicationsExist()
        {
            var accountId = Guid.NewGuid();
            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 4 });
            _appRepo.Setup(r => r.GetAllByAccountIdAsync(accountId))
                    .ReturnsAsync(new List<LecturerApplication>());

            var result = await _sut.GetMyApplicationsAsync(accountId);

            Assert.IsNotNull(result);
            Assert.IsEmpty(result);
        }
        [Test]
        public async Task ReturnsApplicationsMappedToDto_WhenApplicationsExist()
        {
            var accountId = Guid.NewGuid();
            var now = DateTime.Now;

            var app = new LecturerApplication
            {
                Cv = "cv.pdf",
                Degree = "degree.jpg",
                Title = "Title",
                Profession = "Prof",
                Description = "Desc",
                Status = "Accepted",
                Reason = "None",
                CreatedAt = now
            };

            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 4 });
            _appRepo.Setup(r => r.GetAllByAccountIdAsync(accountId))
                    .ReturnsAsync(new List<LecturerApplication> { app });

            var result = await _sut.GetMyApplicationsAsync(accountId);

            Assert.AreEqual(1, result.Count);
            var dto = result[0];
            Assert.AreEqual("cv.pdf", dto.Cv);
            Assert.AreEqual("degree.jpg", dto.Degree);
            Assert.AreEqual("Title", dto.Title);
            Assert.AreEqual("Prof", dto.Profession);
            Assert.AreEqual("Desc", dto.Description);
            Assert.AreEqual("Accepted" , dto.Status);
            Assert.AreEqual("None", dto.RejectReason);
            Assert.AreEqual(now, dto.CreatedAt);
            Assert.IsNull(dto.UpdatedAt);
        }
        [Test]
        public async Task ReturnsApplicationsWithEmptyStrings_WhenApplicationFieldsAreNull()
        {
            var accountId = Guid.NewGuid();
            var now = DateTime.Now;

            var app = new LecturerApplication
            {
                Cv = null,
                Degree = null,
                Title = null,
                Profession = null,
                Description = null,
                Status = "Pending",
                Reason = null,
                CreatedAt = now
            };

            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 4 });
            _appRepo.Setup(r => r.GetAllByAccountIdAsync(accountId))
                    .ReturnsAsync(new List<LecturerApplication> { app });

            var result = await _sut.GetMyApplicationsAsync(accountId);

            Assert.AreEqual(1, result.Count);
            var dto = result[0];
            Assert.AreEqual(string.Empty, dto.Cv);
            Assert.AreEqual(string.Empty, dto.Degree);
            Assert.AreEqual(string.Empty, dto.Title);
            Assert.AreEqual(string.Empty, dto.Profession);
            Assert.AreEqual(null, dto.Description);
            Assert.AreEqual("Pending", dto.Status);
            Assert.AreEqual(null, dto.RejectReason);
            Assert.AreEqual(now, dto.CreatedAt);
            Assert.IsNull(dto.UpdatedAt);
        }
        [Test]
        public async Task ReturnsEmptyStringForCv_WhenCvIsNull()
        {
            var accountId = Guid.NewGuid();
            var app = new LecturerApplication
            {
                Cv = null,
                Degree = "degree.jpg",
                Title = "Title",
                Profession = "Prof",
                Description = "Desc",
                Status = "Pending",
                Reason = "None",
                CreatedAt = DateTime.Now
            };

            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 4 });
            _appRepo.Setup(r => r.GetAllByAccountIdAsync(accountId))
                    .ReturnsAsync(new List<LecturerApplication> { app });

            var result = await _sut.GetMyApplicationsAsync(accountId);

            Assert.AreEqual(string.Empty, result[0].Cv);
        }
        [Test]
        public async Task ReturnsEmptyStringForDegree_WhenDegreeIsNull()
        {
            var accountId = Guid.NewGuid();
            var app = new LecturerApplication
            {
                Cv = "cv.pdf",
                Degree = null,
                Title = "Title",
                Profession = "Prof",
                Description = "Desc",
                Status = "Pending",
                Reason = "None",
                CreatedAt = DateTime.Now
            };

            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 4 });
            _appRepo.Setup(r => r.GetAllByAccountIdAsync(accountId))
                    .ReturnsAsync(new List<LecturerApplication> { app });

            var result = await _sut.GetMyApplicationsAsync(accountId);

            Assert.AreEqual(string.Empty, result[0].Degree);
        }
        [Test]
        public async Task ReturnsEmptyStringForTitle_WhenTitleIsNull()
        {
            var accountId = Guid.NewGuid();
            var app = new LecturerApplication
            {
                Cv = "cv.pdf",
                Degree = "degree.jpg",
                Title = null,
                Profession = "Prof",
                Description = "Desc",
                Status = "Pending",
                Reason = "None",
                CreatedAt = DateTime.Now
            };

            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 4 });
            _appRepo.Setup(r => r.GetAllByAccountIdAsync(accountId))
                    .ReturnsAsync(new List<LecturerApplication> { app });

            var result = await _sut.GetMyApplicationsAsync(accountId);

            Assert.AreEqual(string.Empty, result[0].Title);
        }
        [Test]
        public async Task ReturnsEmptyStringForProfession_WhenProfessionIsNull()
        {
            var accountId = Guid.NewGuid();
            var app = new LecturerApplication
            {
                Cv = "cv.pdf",
                Degree = "degree.jpg",
                Title = "Title",
                Profession = null,
                Description = "Desc",
                Status = "Pending",
                Reason = "None",
                CreatedAt = DateTime.Now
            };

            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 4 });
            _appRepo.Setup(r => r.GetAllByAccountIdAsync(accountId))
                    .ReturnsAsync(new List<LecturerApplication> { app });

            var result = await _sut.GetMyApplicationsAsync(accountId);

            Assert.AreEqual(string.Empty, result[0].Profession);
        }
        [Test]
        public async Task ReturnsNullForDescription_WhenDescriptionIsNull()
        {
            var accountId = Guid.NewGuid();
            var app = new LecturerApplication
            {
                Cv = "cv.pdf",
                Degree = "degree.jpg",
                Title = "Title",
                Profession = "Prof",
                Description = null,
                Status = "Pending",
                Reason = "None",
                CreatedAt = DateTime.Now
            };

            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 4 });
            _appRepo.Setup(r => r.GetAllByAccountIdAsync(accountId))
                    .ReturnsAsync(new List<LecturerApplication> { app });

            var result = await _sut.GetMyApplicationsAsync(accountId);

            Assert.IsNull(result[0].Description);
        }
        [Test]
        public async Task ReturnsNullForRejectReason_WhenReasonIsNull()
        {
            var accountId = Guid.NewGuid();
            var app = new LecturerApplication
            {
                Cv = "cv.pdf",
                Degree = "degree.jpg",
                Title = "Title",
                Profession = "Prof",
                Description = "Desc",
                Status = "Pending",
                Reason = null,
                CreatedAt = DateTime.Now
            };

            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 4 });
            _appRepo.Setup(r => r.GetAllByAccountIdAsync(accountId))
                    .ReturnsAsync(new List<LecturerApplication> { app });

            var result = await _sut.GetMyApplicationsAsync(accountId);

            Assert.IsNull(result[0].RejectReason);
        }
        //UpdateStatusAsync
        [Test]
        public async Task UpdateStatusAsync_ReturnsFalse_WhenUserIsNull()
        {
            _currentUser.Setup(s => s.UserId).Returns((Guid?)null);

            var result = await _sut.UpdateStatusAsync(Guid.NewGuid(), new UpdateStatusRequestDto { Status = true, Reason = "reason" });

            Assert.IsFalse(result);
        }
        [Test]
        public async Task UpdateStatusAsync_ReturnsFalse_WhenApplicationNotFound()
        {
            _currentUser.Setup(s => s.UserId).Returns(Guid.NewGuid());

            _appRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
                    .ReturnsAsync((LecturerApplication)null);

            var result = await _sut.UpdateStatusAsync(Guid.NewGuid(),
                new UpdateStatusRequestDto { Status = true });

            Assert.IsFalse(result);
        }
        
      
        [Test]
        public async Task UpdateStatusAsync_ReturnsFalse_WhenStatusTrueButApplicationHasNoAccountId()
        {
            // Arrange
            var userId = Guid.NewGuid();
            _currentUser.Setup(s => s.UserId).Returns(userId);

            var applicationId = Guid.NewGuid();

            var app = new LecturerApplication
            {
                Id = applicationId,
                AccountId = null,     
                Title = "Title",
                Profession = "Profession"
            };

            _appRepo.Setup(r => r.GetByIdAsync(applicationId))
                    .ReturnsAsync(app);

            _appRepo.Setup(r => r.UpdateStatusAsync(applicationId, true, "reason"))
                    .ReturnsAsync(new LecturerApplication());

            _appRepo.Setup(r => r.SaveChangesAsync())
                    .ReturnsAsync(true);

            // Act
            var result = await _sut.UpdateStatusAsync(
                applicationId,
                new UpdateStatusRequestDto { Status = true, Reason = "reason" }
            );

            // Assert
            Assert.IsFalse(result);
        }



    }
}