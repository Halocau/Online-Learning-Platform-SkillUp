using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Moq;
using NUnit.Framework;
using SkillUp.Services.Implementations;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;
using SkillUp.Services.Interfaces;
using SkillUp.BussinessObjects.DTOs.LecturerApplication;
using SkillUp.BussinessObjects.Models;

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
        //method : ApplyCvAsync 
        [Test]
        public async Task ApplyCvAsync_ReturnsTrue_WhenAccountIsLecturer_AndSaveSucceeds()
        {
            var accountId = Guid.NewGuid();

            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 4 });

            var mockCvFile = new Mock<IFormFile>().Object;
            var mockDegreeFile = new Mock<IFormFile>().Object;

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
        }

        [Test]
        public async Task ApplyCvAsync_ReturnsFalse_WhenAccountDoesNotExist()
        {
            var accountId = Guid.NewGuid();

            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync((Account)null);

            var mockCvFile = new Mock<IFormFile>().Object;
            var mockDegreeFile = new Mock<IFormFile>().Object;

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
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 2 });

            var mockCvFile = new Mock<IFormFile>().Object;
            var mockDegreeFile = new Mock<IFormFile>().Object;

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
        //cv null
        [Test]
        public async Task ApplyCvAsync_ThrowsException_WhenCvFileIsNull()
        {
            var accountId = Guid.NewGuid();

            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 4 });

            var mockDegreeFile = new Mock<IFormFile>().Object;

            var req = new ApplyCvRequestDto
            {
                CvFile = null,
                DegreeFile = new List<IFormFile> { mockDegreeFile },
                Description = "desc",
                Title = "title",
                Profession = "prof"
            };

            Assert.ThrowsAsync<ArgumentNullException>(async () =>
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
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 4 });

            var req = new ApplyCvRequestDto
            {
                CvFile = new Mock<IFormFile>().Object,
                DegreeFile = null,
                Description = "desc",
                Title = "title",
                Profession = "prof"
            };

            Assert.ThrowsAsync<ArgumentNullException>(async () =>
                await _sut.ApplyCvAsync(accountId, req)
            );

            _accountRepo.Verify(r => r.GetByIdAsync(accountId), Times.Once);
        }
        [Test]
        public async Task ApplyCvAsync_ThrowsException_WhenDegreeFileIsEmpty()
        {
            var accountId = Guid.NewGuid();

            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 4 });

            var req = new ApplyCvRequestDto
            {
                CvFile = new Mock<IFormFile>().Object,
                DegreeFile = new List<IFormFile>(),
                Description = "desc",
                Title = "title",
                Profession = "prof"
            };

            Assert.ThrowsAsync<ArgumentNullException>(async () =>
                await _sut.ApplyCvAsync(accountId, req)
            );

            _accountRepo.Verify(r => r.GetByIdAsync(accountId), Times.Once);
        }
        [Test]
        public async Task ApplyCvAsync_ReturnsTrue_WhenMultipleDegreeFilesProvided()
        {
            var accountId = Guid.NewGuid();

            _accountRepo.Setup(r => r.GetByIdAsync(accountId))
                        .ReturnsAsync(new Account { Id = accountId, RoleId = 4 });

            var mockCvFile = new Mock<IFormFile>().Object;

            var degreeFiles = new List<IFormFile>();
            for (int i = 0; i < 10; i++)
            {
                degreeFiles.Add(new Mock<IFormFile>().Object);
            }

            _cloudinary.Setup(c => c.UploadPdfAsync(mockCvFile, "skillup/lecturers/cv"))
                        .ReturnsAsync("https://cloudinary.com/cv.pdf");

            _cloudinary.Setup(c => c.UploadImageAsync(It.IsAny<IFormFile>(), "skillup/lecturers/degrees"))
                        .ReturnsAsync((IFormFile f, string folder) => $"https://cloudinary.com/degree{degreeFiles.IndexOf(f) + 1}.jpg");

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
            _cloudinary.Verify(c => c.UploadPdfAsync(mockCvFile, "skillup/lecturers/cv"), Times.Once);
            _cloudinary.Verify(c => c.UploadImageAsync(It.IsAny<IFormFile>(), "skillup/lecturers/degrees"), Times.Exactly(10));
            _appRepo.Verify(r => r.AddAsync(It.IsAny<LecturerApplication>()), Times.Once);
            _appRepo.Verify(r => r.SaveChangesAsync(), Times.Once);
        }
        //method : GetMyApplicationsAsync 

    }
}