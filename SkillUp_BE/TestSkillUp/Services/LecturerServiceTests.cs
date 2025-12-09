using Moq;
using NUnit.Framework;
using SkillUp.BussinessObjects.DTOs.Lecturer;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Implementations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SkillUp.Tests.Services
{
    [TestFixture]
    public class LecturerServiceTests
    {
        private Mock<ILecturerRepository> _mockLecturerRepository;
        private LecturerService _lecturerService;

        [SetUp]
        public void Setup()
        {
            _mockLecturerRepository = new Mock<ILecturerRepository>();

            // Inject cùng mock object vào cả 2 tham số để xử lý code smell trong constructor
            _lecturerService = new LecturerService(
                _mockLecturerRepository.Object,
                _mockLecturerRepository.Object
            );
        }

        #region 1. CreateLecturerAsync

        [Test]
        public async Task CreateLecturerAsync_ValidLecturer_CallsAddAndSave_ReturnsTrue()
        {
            // Arrange
            var lecturer = new Lecturer();

            _mockLecturerRepository.Setup(repo => repo.AddAsync(It.IsAny<Lecturer>()))
                .ReturnsAsync(new Lecturer());
            _mockLecturerRepository.Setup(repo => repo.SaveChangesAsync())
                .ReturnsAsync(true);

            // Act
            var result = await _lecturerService.CreateLecturerAsync(lecturer);

            // Assert
            Assert.IsTrue(result);
            _mockLecturerRepository.Verify(repo => repo.AddAsync(lecturer), Times.Once);
            _mockLecturerRepository.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }

        #endregion

        #region 2. GetLecturerByAccountIdAsync

        [Test]
        public async Task GetLecturerByAccountIdAsync_LecturerExists_ReturnsDto()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var lecturer = new Lecturer { Id = Guid.NewGuid(), Title = "Professor", Profession = "CS" };

            _mockLecturerRepository.Setup(repo => repo.GetByAccountIdAsync(accountId))
                .ReturnsAsync(lecturer);

            // Act
            var result = await _lecturerService.GetLecturerByAccountIdAsync(accountId);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("Professor", result.Title);
            Assert.AreEqual("CS", result.Profession);
        }

        [Test]
        public async Task GetLecturerByAccountIdAsync_LecturerNotFound_ReturnsNull()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            _mockLecturerRepository.Setup(repo => repo.GetByAccountIdAsync(accountId))
                .ReturnsAsync((Lecturer)null);

            // Act
            var result = await _lecturerService.GetLecturerByAccountIdAsync(accountId);

            // Assert
            Assert.IsNull(result);
        }

        #endregion

        #region 3. UpdateLecturerAsync

        [Test]
        public async Task UpdateLecturerAsync_LecturerExists_UpdatesAndReturnsTrue()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var existingLecturer = new Lecturer { AccountId = accountId, Title = "Old", Profession = "Old" };
            var updateDto = new LecturerUpdateDto { Title = "New Title", Profession = "New Prof" };

            _mockLecturerRepository.Setup(repo => repo.GetByAccountIdAsync(accountId))
                .ReturnsAsync(existingLecturer);
            _mockLecturerRepository.Setup(repo => repo.SaveChangesAsync())
                .ReturnsAsync(true);

            // Act
            var result = await _lecturerService.UpdateLecturerAsync(accountId, updateDto);

            // Assert
            Assert.IsTrue(result);
            Assert.AreEqual("New Title", existingLecturer.Title);
            Assert.AreEqual("New Prof", existingLecturer.Profession);
            _mockLecturerRepository.Verify(repo => repo.UpdateAsync(existingLecturer), Times.Once);
        }

        [Test]
        public async Task UpdateLecturerAsync_LecturerNotFound_ReturnsFalse()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            _mockLecturerRepository.Setup(repo => repo.GetByAccountIdAsync(accountId))
                .ReturnsAsync((Lecturer)null);

            // Act
            var result = await _lecturerService.UpdateLecturerAsync(accountId, new LecturerUpdateDto());

            // Assert
            Assert.IsFalse(result);
        }

        #endregion

        #region 4. AddLecturerAsync (DTO)

        [Test]
        public async Task AddLecturerAsync_ValidDto_AddsToRepoAndReturnsDto()
        {
            // Arrange
            var createDto = new LecturerCreateDto
            {
                AccountId = Guid.NewGuid(),
                Title = "Dr",
                Profession = "Math"
            };

            _mockLecturerRepository.Setup(repo => repo.AddAsync(It.IsAny<Lecturer>()))
                .ReturnsAsync(new Lecturer());
            _mockLecturerRepository.Setup(repo => repo.SaveChangesAsync())
                .ReturnsAsync(true);

            // Act
            var result = await _lecturerService.AddLecturerAsync(createDto);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("Dr", result.Title);
            _mockLecturerRepository.Verify(repo => repo.AddAsync(It.Is<Lecturer>(l => l.AccountId == createDto.AccountId)), Times.Once);
        }

        #endregion

        #region 5. GetAllLecturersAsync

        [Test]
        public async Task GetAllLecturersAsync_ReturnsListOfDtos()
        {
            // Arrange
            var lecturers = new List<Lecturer>
            {
                new Lecturer { Title = "A", Profession = "P1" },
                new Lecturer { Title = "B", Profession = "P2" }
            };

            _mockLecturerRepository.Setup(repo => repo.GetAllLecturersAsync())
                .ReturnsAsync(lecturers);

            // Act
            var result = await _lecturerService.GetAllLecturersAsync();

            // Assert
            Assert.AreEqual(2, result.Count);
            Assert.AreEqual("A", result[0].Title);
        }

        #endregion

        #region 6. UpdateLecturerInfoAsync

        [Test]
        public async Task UpdateLecturerInfoAsync_AccountIdNull_ReturnsFalse()
        {
            // Act
            var result = await _lecturerService.UpdateLecturerInfoAsync(null, "Title", "Prof");

            // Assert
            Assert.IsFalse(result);
        }

        [Test]
        public async Task UpdateLecturerInfoAsync_LecturerNotFound_ReturnsFalse()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            _mockLecturerRepository.Setup(repo => repo.GetByAccountIdAsync(accountId))
                .ReturnsAsync((Lecturer)null);

            // Act
            var result = await _lecturerService.UpdateLecturerInfoAsync(accountId, "Title", "Prof");

            // Assert
            Assert.IsFalse(result);
        }

        [Test]
        public async Task UpdateLecturerInfoAsync_ValidId_UpdatesFields()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var lecturer = new Lecturer();

            _mockLecturerRepository.Setup(repo => repo.GetByAccountIdAsync(accountId))
                .ReturnsAsync(lecturer);
            _mockLecturerRepository.Setup(repo => repo.SaveChangesAsync())
                .ReturnsAsync(true);

            // Act
            var result = await _lecturerService.UpdateLecturerInfoAsync(accountId, "New Title", "New Prof");

            // Assert
            Assert.IsTrue(result);
            Assert.AreEqual("New Title", lecturer.Title);
            Assert.AreEqual("New Prof", lecturer.Profession);
        }

        #endregion

        #region 7. GetLecturerPublicProfileAsync

        [Test]
        public async Task GetLecturerPublicProfileAsync_ValidData_CalculatesStatsCorrectly()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var lecturer = new Lecturer
            {
                Id = Guid.NewGuid(),
                AccountId = accountId,
                Title = "Master",
                Profession = "IT",
                Account = new Account { Fullname = "Nguyen Van A", Avatar = "avatar.png" },
                Courses = new List<Course>
                {
                    // Hợp lệ
                    new Course { Title = "C1", Status = "Public", IsActive = true, EnrollmentCount = 10, Rating = 5, Price = 100 },
                    new Course { Title = "C2", Status = "Public", IsActive = true, EnrollmentCount = 20, Rating = 4, Price = 200 },
                    // Không hợp lệ
                    new Course { Title = "C3", Status = "Public", IsActive = false, EnrollmentCount = 100, Rating = 1 },
                    new Course { Title = "C4", Status = "Draft", IsActive = true, EnrollmentCount = 50, Rating = 5 }
                }
            };

            _mockLecturerRepository.Setup(repo => repo.GetLecturerProfileByAccountAsync(accountId))
                .ReturnsAsync(lecturer);

            // Act
            var result = await _lecturerService.GetLecturerPublicProfileAsync(accountId);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("Nguyen Van A", result.FullName);
            Assert.AreEqual(2, result.TotalCourses);
            Assert.AreEqual(30, result.TotalStudents);
            Assert.AreEqual(4.5, result.AverageRating);
        }

        [Test]
        public void GetLecturerPublicProfileAsync_NotFound_ThrowsException()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            _mockLecturerRepository.Setup(repo => repo.GetLecturerProfileByAccountAsync(accountId))
                .ReturnsAsync((Lecturer)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(async () =>
                await _lecturerService.GetLecturerPublicProfileAsync(accountId));

            Assert.AreEqual("Không tìm thấy giảng viên này.", ex.Message);
        }

        [Test]
        public async Task GetLecturerPublicProfileAsync_NoPublicCourses_ReturnsZeroStats()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var lecturer = new Lecturer
            {
                AccountId = accountId,
                Account = new Account { Fullname = "Newbie" },
                Courses = new List<Course>
                {
                    new Course { Status = "Draft", IsActive = true }
                }
            };

            _mockLecturerRepository.Setup(repo => repo.GetLecturerProfileByAccountAsync(accountId))
                .ReturnsAsync(lecturer);

            // Act
            var result = await _lecturerService.GetLecturerPublicProfileAsync(accountId);

            // Assert
            Assert.AreEqual(0, result.TotalCourses);
            Assert.AreEqual(0, result.TotalStudents);
            Assert.AreEqual(0, result.AverageRating);
        }

        [Test]
        public async Task GetLecturerPublicProfileAsync_HasCoursesButNoRating_ReturnsZeroRating()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var lecturer = new Lecturer
            {
                AccountId = accountId,
                Account = new Account { Fullname = "Teacher" },
                Courses = new List<Course>
                {
                    new Course { Status = "Public", IsActive = true, Rating = 0, EnrollmentCount = 10 }
                }
            };

            _mockLecturerRepository.Setup(repo => repo.GetLecturerProfileByAccountAsync(accountId))
                .ReturnsAsync(lecturer);

            // Act
            var result = await _lecturerService.GetLecturerPublicProfileAsync(accountId);

            // Assert
            Assert.AreEqual(1, result.TotalCourses);
            Assert.AreEqual(0, result.AverageRating);
        }

        #endregion

        #region 8. GetProfileByAccountIdAsync & UpdateLecturerProfileAsync

        [Test]
        public async Task GetProfileByAccountIdAsync_Found_ReturnsProfileDto()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var lecturer = new Lecturer { BankName = "VCB", BankNumber = "123" };

            // Mock method repository cho tham số thứ 2
            _mockLecturerRepository.Setup(repo => repo.GetLecturerByAccountIdAsync(accountId))
                .ReturnsAsync(lecturer);

            // Act
            var result = await _lecturerService.GetProfileByAccountIdAsync(accountId);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("VCB", result.BankName);
        }

        [Test]
        public async Task GetProfileByAccountIdAsync_NotFound_ReturnsNull()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            _mockLecturerRepository.Setup(repo => repo.GetLecturerByAccountIdAsync(accountId))
                .ReturnsAsync((Lecturer)null);

            // Act
            var result = await _lecturerService.GetProfileByAccountIdAsync(accountId);

            // Assert
            Assert.IsNull(result);
        }

        [Test]
        public async Task UpdateLecturerProfileAsync_ValidRequest_UpdatesAndReturnsTrue()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var lecturer = new Lecturer();
            var request = new UpdateLecturerProfileDto
            {
                BankName = "TPBank",
                ReceiverName = "User A",
                BankNumber = "999"
            };

            _mockLecturerRepository.Setup(repo => repo.GetLecturerByAccountIdAsync(accountId))
                .ReturnsAsync(lecturer);
            _mockLecturerRepository.Setup(repo => repo.SaveChangesAsync())
                .ReturnsAsync(true);

            // Act
            var result = await _lecturerService.UpdateLecturerProfileAsync(accountId, request);

            // Assert
            Assert.IsTrue(result);
            Assert.AreEqual("TPBank", lecturer.BankName);
            Assert.AreEqual("User A", lecturer.ReceiverName);
        }

        [Test]
        public async Task UpdateLecturerProfileAsync_LecturerNotFound_ReturnsFalse()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            _mockLecturerRepository.Setup(repo => repo.GetLecturerByAccountIdAsync(accountId))
                .ReturnsAsync((Lecturer)null);

            // Act
            var result = await _lecturerService.UpdateLecturerProfileAsync(accountId, new UpdateLecturerProfileDto());

            // Assert
            Assert.IsFalse(result);
        }

        #endregion
    }
}