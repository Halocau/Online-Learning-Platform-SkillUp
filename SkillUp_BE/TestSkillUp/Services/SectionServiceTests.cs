using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Moq;
using NUnit.Framework;
using SkillUp.Bussiness.Services;
using SkillUp.BussinessObjects.Dtos.Section;
using SkillUp.BussinessObjects.DTOs.Section;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace TestSkillUp
{
    [TestFixture]
    public class SectionServiceTests
    {
        private Mock<ISectionRepository> _sectionRepositoryMock = null!;
        private Mock<ILessonRepository> _lessonRepositoryMock = null!;
        private Mock<IQuizRepository> _quizRepositoryMock = null!;
        private Mock<ICurrentUserService> _currentUserServiceMock = null!;

        private ISectionService _iSectionService = null!; // System Under Test

        [SetUp]
        public void SetUp()
        {
            _sectionRepositoryMock = new Mock<ISectionRepository>(MockBehavior.Strict);
            _lessonRepositoryMock = new Mock<ILessonRepository>(MockBehavior.Strict);
            _quizRepositoryMock = new Mock<IQuizRepository>(MockBehavior.Strict);
            _currentUserServiceMock = new Mock<ICurrentUserService>(MockBehavior.Loose);

            // Mặc định setup RoleId = 4 (giảng viên) để các test case hiện có pass
            _currentUserServiceMock.Setup(s => s.RoleId).Returns(4);

            _iSectionService = new SectionService(
                _sectionRepositoryMock.Object,
                _lessonRepositoryMock.Object,
                _quizRepositoryMock.Object,
                context: null!,
                _currentUserServiceMock.Object
            );
        }

        // -------- CreateSectionAsync --------

        // Test 0: Tạo Section với roleId != 4 - ném UnauthorizedAccessException
        [Test]
        public void CreateSectionAsync_RoleIdNotFour_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            _currentUserServiceMock.Setup(s => s.RoleId).Returns(3); // Admin hoặc role khác
            var createDto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "Valid Title",
                Description = "Valid Description",
                Orders = 1
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => _iSectionService.CreateSectionAsync(createDto));
            Assert.That(ex!.Message, Does.Contain("Chỉ giảng viên mới được tạo section"));
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Never);
        }

        // Test 0.1: Tạo Section với roleId = null - ném UnauthorizedAccessException
        [Test]
        public void CreateSectionAsync_RoleIdNull_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            _currentUserServiceMock.Setup(s => s.RoleId).Returns((int?)null);
            var createDto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "Valid Title",
                Description = "Valid Description",
                Orders = 1
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => _iSectionService.CreateSectionAsync(createDto));
            Assert.That(ex!.Message, Does.Contain("Chỉ giảng viên mới được tạo section"));
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Never);
        }

        // Test 0.2: Tạo Section với roleId = 5 (Student) - ném UnauthorizedAccessException
        [Test]
        public void CreateSectionAsync_RoleIdFive_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            _currentUserServiceMock.Setup(s => s.RoleId).Returns(5); // Student
            var createDto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "Valid Title",
                Description = "Valid Description",
                Orders = 1
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => _iSectionService.CreateSectionAsync(createDto));
            Assert.That(ex!.Message, Does.Contain("Chỉ giảng viên mới được tạo section"));
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Never);
        }

        // Test 1: Tạo Section thành công với dữ liệu hợp lệ
        [Test]
        public async Task CreateSectionAsync_ValidData_ReturnsCreatedDto()
        {
            // Arrange
            var courseId = Guid.NewGuid();
            var createDto = new SectionCreateDto
            {
                CourseId = courseId,
                Title = "Introduction to Programming",
                Description = "Basic programming concepts",
                Orders = 1
            };

            Section? capturedSection = null;
            _sectionRepositoryMock
                .Setup(r => r.CreateAsync(It.IsAny<Section>()))
                .ReturnsAsync((Section s) =>
                {
                    capturedSection = s;
                    return s;
                });

            // Act
            var result = await _iSectionService.CreateSectionAsync(createDto);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(createDto.Title, result.Title);
            Assert.AreEqual(createDto.Description, result.Description);
            Assert.AreEqual(createDto.CourseId, result.CourseId);
            Assert.AreEqual(createDto.Orders, result.Orders);
            Assert.IsTrue(result.IsActive);
            Assert.IsNotNull(capturedSection);
            Assert.AreNotEqual(Guid.Empty, capturedSection!.Id);
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Once);
        }

        // Test 2: Tạo Section với Title trống - ném ArgumentException
        [Test]
        public void CreateSectionAsync_EmptyTitle_ThrowsArgumentException()
        {
            // Arrange
            var dto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "",
                Description = "Desc",
                Orders = 1
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<ArgumentException>(() => _iSectionService.CreateSectionAsync(dto));
            Assert.That(ex!.ParamName, Is.EqualTo("Title"));
            StringAssert.Contains("không được để trống", ex.Message);
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Never);
        }

        // Test 3: Tạo Section với Title null - ném ArgumentException
        [Test]
        public void CreateSectionAsync_NullTitle_ThrowsArgumentException()
        {
            // Arrange
            var dto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = null!,
                Description = "Desc",
                Orders = 1
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<ArgumentException>(() => _iSectionService.CreateSectionAsync(dto));
            Assert.That(ex!.ParamName, Is.EqualTo("Title"));
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Never);
        }

        [Test]
        public void CreateSectionAsync_EmptyDescription_ThrowsArgumentException()
        {
            // Arrange
            var dto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "Valid Title",
                Description = "",
                Orders = 1
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<ArgumentException>(() => _iSectionService.CreateSectionAsync(dto));
            Assert.That(ex!.ParamName, Is.EqualTo("Description"));
            StringAssert.Contains("không được để trống", ex.Message);
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Never);
        }


        // Test 7: Tạo Section với Description null - thành công (optional)
        [Test]
        public async Task CreateSectionAsync_NullDescription_Success()
        {
            // Arrange
            var dto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "Valid Title",
                Description = null,
                Orders = 1
            };

            _sectionRepositoryMock
                .Setup(r => r.CreateAsync(It.IsAny<Section>()))
                .ReturnsAsync((Section s) => s);

            // Act
            var result = await _iSectionService.CreateSectionAsync(dto);

            // Assert
            Assert.IsNotNull(result);
            Assert.IsNull(result.Description);
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Once);
        }

        // Test 8: Tạo Section với Orders null - ném ArgumentException
        [Test]
        public void CreateSectionAsync_NullOrders_ThrowsArgumentException()
        {
            // Arrange
            var dto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "Valid Title",
                Description = "Desc",
                Orders = null
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<ArgumentException>(() => _iSectionService.CreateSectionAsync(dto));
            Assert.That(ex!.ParamName, Is.EqualTo("Orders"));
            StringAssert.Contains("không được để trống", ex.Message);
            StringAssert.Contains("phải lớn hơn 0", ex.Message);
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Never);
        }

        // Test 9: Tạo Section với Orders = 0 - ném ArgumentException
        [Test]
        public void CreateSectionAsync_ZeroOrders_ThrowsArgumentException()
        {
            // Arrange
            var dto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "Valid Title",
                Description = "Desc",
                Orders = 0
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<ArgumentException>(() => _iSectionService.CreateSectionAsync(dto));
            Assert.That(ex!.ParamName, Is.EqualTo("Orders"));
            StringAssert.Contains("phải lớn hơn 0", ex.Message);
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Never);
        }

        // Test 10: Tạo Section với Orders âm - ném ArgumentException
        [Test]
        public void CreateSectionAsync_NegativeOrders_ThrowsArgumentException()
        {
            // Arrange
            var dto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "Valid Title",
                Description = "Desc",
                Orders = -1
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<ArgumentException>(() => _iSectionService.CreateSectionAsync(dto));
            Assert.That(ex!.ParamName, Is.EqualTo("Orders"));
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Never);
        }

        // Test 11: Tạo Section với Orders = 1 (minimum valid) - thành công
        [Test]
        public async Task CreateSectionAsync_OrdersEqualsOne_Success()
        {
            // Arrange
            var dto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "Valid Title",
                Description = "Desc",
                Orders = 1
            };

            _sectionRepositoryMock
                .Setup(r => r.CreateAsync(It.IsAny<Section>()))
                .ReturnsAsync((Section s) => s);

            // Act
            var result = await _iSectionService.CreateSectionAsync(dto);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(1, result.Orders);
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Once);
        }

        // Test 12: Tạo Section với Orders lớn - thành công
        [Test]
        public async Task CreateSectionAsync_LargeOrders_Success()
        {
            // Arrange
            var dto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "Valid Title",
                Description = "Desc",
                Orders = 999
            };

            _sectionRepositoryMock
                .Setup(r => r.CreateAsync(It.IsAny<Section>()))
                .ReturnsAsync((Section s) => s);

            // Act
            var result = await _iSectionService.CreateSectionAsync(dto);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(999, result.Orders);
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Once);
        }

        // Test 17: Khi repository ném exception - propagate exception
        [Test]
        public void CreateSectionAsync_RepositoryThrows_PropagatesException()
        {
            // Arrange
            var dto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "Valid Title",
                Description = "Desc",
                Orders = 1
            };

            _sectionRepositoryMock
                .Setup(r => r.CreateAsync(It.IsAny<Section>()))
                .ThrowsAsync(new Exception("DB error"));

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() => _iSectionService.CreateSectionAsync(dto));
            StringAssert.Contains("DB error", ex!.Message);
        }


        // -------- GetSectionByIdAsync --------

        // Khi không tìm thấy Section theo Id thì hàm trả về null
        [Test]
        public async Task GetSectionByIdAsync_NotFound_ReturnsNull()
        {
            // Arrange
            var id = Guid.NewGuid();
            _sectionRepositoryMock
                .Setup(r => r.GetByIdAsync(id))
                .ReturnsAsync((Section?)null);

            // Act
            var result = await _iSectionService.GetSectionByIdAsync(id);

            // Assert
            Assert.IsNull(result);
            _sectionRepositoryMock.Verify(r => r.GetByIdAsync(id), Times.Once);
        }

        // Khi tìm thấy Section thì trả về SectionDto với dữ liệu map đúng
        [Test]
        public async Task GetSectionByIdAsync_Found_ReturnsDto()
        {
            // Arrange
            var id = Guid.NewGuid();
            var entity = new Section
            {
                Id = id,
                CourseId = Guid.NewGuid(),
                Title = "Section 1",
                Description = "Desc",
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                Orders = 2
            };

            _sectionRepositoryMock
                .Setup(r => r.GetByIdAsync(id))
                .ReturnsAsync(entity);

            // Act
            var result = await _iSectionService.GetSectionByIdAsync(id);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(entity.Id, result!.Id);
            Assert.AreEqual(entity.CourseId, result.CourseId);
            Assert.AreEqual(entity.Title, result.Title);
            Assert.AreEqual(entity.Description, result.Description);
            Assert.AreEqual(entity.IsActive, result.IsActive);
            Assert.AreEqual(entity.Orders, result.Orders);
        }

        // -------- GetSectionsByCourseIdAsync --------

        [Test]
        public async Task GetSectionsByCourseIdAsync_ReturnsMappedList()
        {
            // Arrange
            var courseId = Guid.NewGuid();
            var sections = new List<Section>
            {
                new Section
                {
                    Id = Guid.NewGuid(),
                    CourseId = courseId,
                    Title = "S1",
                    Description = "D1",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    Orders = 1
                },
                new Section
                {
                    Id = Guid.NewGuid(),
                    CourseId = courseId,
                    Title = "S2",
                    Description = "D2",
                    CreatedAt = DateTime.UtcNow,
                    IsActive = true,
                    Orders = 2
                }
            };

            _sectionRepositoryMock
                .Setup(r => r.GetByCourseIdAsync(courseId))
                .ReturnsAsync(sections);

            // Act
            var result = await _iSectionService.GetSectionsByCourseIdAsync(courseId);

            // Assert
            var list = result.ToList();
            Assert.AreEqual(2, list.Count);
            Assert.AreEqual("S1", list[0].Title);
            Assert.AreEqual("S2", list[1].Title);
        }

        // -------- UpdateSectionAsync --------

        // Khi không tìm thấy Section để cập nhật thì trả về null
        [Test]
        public async Task UpdateSectionAsync_NotFound_ReturnsNull()
        {
            // Arrange
            var id = Guid.NewGuid();
            var updateDto = new SectionUpdateDto
            {
                Title = "Updated",
                Description = "Updated desc"
            };

            _sectionRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync((Section?)null);

            // Act
            var result = await _iSectionService.UpdateSectionAsync(id, updateDto);

            // Assert
            Assert.IsNull(result);
        }

        // Khi repository UpdateAsync ném exception thì service cũng ném ra
        [Test]
        public void UpdateSectionAsync_RepositoryThrows_PropagatesException()
        {
            // Arrange
            var id = Guid.NewGuid();
            var updateDto = new SectionUpdateDto
            {
                Title = "New Title",
                Description = "New Desc"
            };

            _sectionRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(new Section { Id = id });

            _sectionRepositoryMock
                .Setup(r => r.UpdateAsync(It.IsAny<Section>()))
                .ThrowsAsync(new Exception("Update failed"));

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() => _iSectionService.UpdateSectionAsync(id, updateDto));
            StringAssert.Contains("Update failed", ex!.Message);
        }

        // Khi cập nhật Section thành công: Title/Description thay đổi và UpdatedAt được cập nhật
        [Test]
        public async Task UpdateSectionAsync_Found_UpdatesAndReturnsDto()
        {
            // Arrange
            var id = Guid.NewGuid();
            var originalUpdatedAt = DateTime.UtcNow.AddDays(-2);
            var entity = new Section
            {
                Id = id,
                CourseId = Guid.NewGuid(),
                Title = "Old",
                Description = "Old desc",
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                IsActive = true,
                Orders = 1,
                UpdatedAt = originalUpdatedAt
            };

            var updateDto = new SectionUpdateDto
            {
                Title = "New Title",
                Description = "New Desc"
            };

            _sectionRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(entity);

            _sectionRepositoryMock
                .Setup(r => r.UpdateAsync(entity))
                .ReturnsAsync(entity);

            // Act
            var result = await _iSectionService.UpdateSectionAsync(id, updateDto);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(updateDto.Title, result!.Title);
            Assert.AreEqual(updateDto.Description, result.Description);

            // Đảm bảo entity đã được cập nhật đúng và UpdatedAt thay đổi
            Assert.AreEqual(updateDto.Title, entity.Title);
            Assert.AreEqual(updateDto.Description, entity.Description);
            Assert.That(entity.UpdatedAt, Is.Not.EqualTo(originalUpdatedAt));

            _sectionRepositoryMock.Verify(r => r.FindByIdAsync(id), Times.Once);
            _sectionRepositoryMock.Verify(r => r.UpdateAsync(entity), Times.Once);
        }

        // -------- DeleteSectionAsync --------

        // Xóa Section khi không tìm thấy Id: trả về false
        [Test]
        public async Task DeleteSectionAsync_NotFound_ReturnsFalse()
        {
            // Arrange
            var id = Guid.NewGuid();
            _sectionRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync((Section?)null);

            // Act
            var result = await _iSectionService.DeleteSectionAsync(id);

            // Assert
            Assert.IsFalse(result);
        }

        // Khi repository UpdateAsync trong DeleteSectionAsync ném exception thì service cũng ném ra
        [Test]
        public void DeleteSectionAsync_RepositoryThrows_PropagatesException()
        {
            // Arrange
            var id = Guid.NewGuid();
            var entity = new Section
            {
                Id = id,
                IsActive = true
            };

            _sectionRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(entity);

            _sectionRepositoryMock
                .Setup(r => r.UpdateAsync(entity))
                .ThrowsAsync(new Exception("Delete failed"));

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() => _iSectionService.DeleteSectionAsync(id));
            StringAssert.Contains("Delete failed", ex!.Message);
        }

        // Xóa Section đã inactive từ trước: trả về true và không gọi UpdateAsync
        [Test]
        public async Task DeleteSectionAsync_AlreadyInactive_ReturnsTrueWithoutUpdating()
        {
            // Arrange
            var id = Guid.NewGuid();
            var entity = new Section
            {
                Id = id,
                IsActive = false
            };

            _sectionRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(entity);

            // Act
            var result = await _iSectionService.DeleteSectionAsync(id);

            // Assert
            Assert.IsTrue(result);
            _sectionRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Section>()), Times.Never);
        }

        // Xóa Section đang active: đặt IsActive=false, UpdatedAt thay đổi và trả về true
        [Test]
        public async Task DeleteSectionAsync_Active_SetsInactiveAndReturnsTrue()
        {
            // Arrange
            var id = Guid.NewGuid();
            var originalUpdatedAt = DateTime.MinValue;
            var entity = new Section
            {
                Id = id,
                IsActive = true,
                UpdatedAt = originalUpdatedAt
            };

            _sectionRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(entity);

            _sectionRepositoryMock
                .Setup(r => r.UpdateAsync(entity))
                .ReturnsAsync(entity);

            // Act
            var result = await _iSectionService.DeleteSectionAsync(id);

            // Assert
            Assert.IsTrue(result);
            Assert.IsFalse(entity.IsActive);
            Assert.That(entity.UpdatedAt, Is.Not.EqualTo(originalUpdatedAt));
            _sectionRepositoryMock.Verify(r => r.UpdateAsync(entity), Times.Once);
        }

        // -------- RestoreSectionAsync --------

        // Khôi phục Section khi không tìm thấy: trả về null
        [Test]
        public async Task RestoreSectionAsync_NotFound_ReturnsNull()
        {
            // Arrange
            var id = Guid.NewGuid();
            _sectionRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync((Section?)null);

            // Act
            var result = await _iSectionService.RestoreSectionAsync(id);

            // Assert
            Assert.IsNull(result);
        }

        // Khôi phục Section đã active sẵn: trả về DTO hiện tại, không gọi UpdateAsync
        [Test]
        public async Task RestoreSectionAsync_AlreadyActive_ReturnsCurrentDto()
        {
            // Arrange
            var id = Guid.NewGuid();
            var entity = new Section
            {
                Id = id,
                CourseId = Guid.NewGuid(),
                Title = "S1",
                Description = "D1",
                IsActive = true,
                Orders = 1
            };

            _sectionRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(entity);

            // Act
            var result = await _iSectionService.RestoreSectionAsync(id);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(entity.Id, result!.Id);
            Assert.AreEqual(entity.Title, result.Title);

            _sectionRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Section>()), Times.Never);
        }

        // Khôi phục Section đang inactive: đặt IsActive=true, gọi UpdateAsync và trả về DTO
        [Test]
        public async Task RestoreSectionAsync_Inactive_ActivatesAndReturnsDto()
        {
            // Arrange
            var id = Guid.NewGuid();
            var entity = new Section
            {
                Id = id,
                CourseId = Guid.NewGuid(),
                Title = "S1",
                Description = "D1",
                IsActive = false,
                UpdatedAt = DateTime.MinValue,
                Orders = 1
            };

            _sectionRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(entity);

            _sectionRepositoryMock
                .Setup(r => r.UpdateAsync(entity))
                .ReturnsAsync(entity);

            // Act
            var result = await _iSectionService.RestoreSectionAsync(id);

            // Assert
            Assert.IsNotNull(result);
            Assert.IsTrue(entity.IsActive);
            _sectionRepositoryMock.Verify(r => r.UpdateAsync(entity), Times.Once);
        }

        // Các test cho 2 hàm ReorderSectionContentAsync và ReorderSectionsAsync
        // được bỏ qua trong version đơn giản này để không cần DbContext, giống pattern của LessonServiceTests.
    }
}


