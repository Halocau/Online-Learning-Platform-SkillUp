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
                Description = "Valid Description",
                Orders = 1
            };

            _sectionRepositoryMock
                .Setup(r => r.CreateAsync(It.IsAny<Section>()))
                .ReturnsAsync((Section s) => s);

            // Act
            var result = await _iSectionService.CreateSectionAsync(createDto);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(createDto.Title, result.Title);
            Assert.AreEqual(createDto.CourseId, result.CourseId);
            Assert.AreEqual(createDto.Orders, result.Orders);
            Assert.IsTrue(result.IsActive);
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Once);
        }

        // Test 2: Tạo Section với roleId != 4 - ném UnauthorizedAccessException
        [Test]
        public void CreateSectionAsync_RoleIdNotFour_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            _currentUserServiceMock.Setup(s => s.RoleId).Returns(3);
            var createDto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "Valid Title",
                Description = null,
                Orders = 1
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => _iSectionService.CreateSectionAsync(createDto));
            Assert.That(ex!.Message, Does.Contain("Chỉ giảng viên mới được tạo section"));
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Never);
        }

        // Test 3: Tạo Section với Title trống - ném ArgumentException
        [Test]
        public void CreateSectionAsync_EmptyTitle_ThrowsArgumentException()
        {
            // Arrange
            var dto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "",
                Description = null,
                Orders = 1
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<ArgumentException>(() => _iSectionService.CreateSectionAsync(dto));
            Assert.That(ex!.ParamName, Is.EqualTo("Title"));
            StringAssert.Contains("không được để trống", ex.Message);
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Never);
        }

        // Test 4: Tạo Section với Title null - ném ArgumentException
        [Test]
        public void CreateSectionAsync_NullTitle_ThrowsArgumentException()
        {
            // Arrange
            var dto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = null!,
                Description = null,
                Orders = 1
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<ArgumentException>(() => _iSectionService.CreateSectionAsync(dto));
            Assert.That(ex!.ParamName, Is.EqualTo("Title"));
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Never);
        }

        // Test 5: Tạo Section với Description trống - ném ArgumentException
        [Test]
        public void CreateSectionAsync_EmptyDescription_ThrowsArgumentException()
        {
            // Arrange
            var dto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "Valid Title",
                Description = null,
                Orders = 1
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<ArgumentException>(() => _iSectionService.CreateSectionAsync(dto));
            Assert.That(ex!.ParamName, Is.EqualTo("Description"));
            StringAssert.Contains("không được để trống", ex.Message);
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Never);
        }

        // Test 6: Tạo Section với Orders null - ném ArgumentException
        [Test]
        public void CreateSectionAsync_NullOrders_ThrowsArgumentException()
        {
            // Arrange
            var dto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "Valid Title",
                Description = "Valid Description",
                Orders = null
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<ArgumentException>(() => _iSectionService.CreateSectionAsync(dto));
            Assert.That(ex!.ParamName, Is.EqualTo("Orders"));
            StringAssert.Contains("không được để trống", ex.Message);
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Never);
        }

        // Test 7: Tạo Section với Orders = 0 - ném ArgumentException
        [Test]
        public void CreateSectionAsync_ZeroOrders_ThrowsArgumentException()
        {
            // Arrange
            var dto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "Valid Title",
                Description = "Valid Description",
                Orders = 0
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<ArgumentException>(() => _iSectionService.CreateSectionAsync(dto));
            Assert.That(ex!.ParamName, Is.EqualTo("Orders"));
            StringAssert.Contains("phải lớn hơn 0", ex.Message);
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Never);
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

        // Khi courseId không có section nào thì trả về danh sách rỗng
        [Test]
        public async Task GetSectionsByCourseIdAsync_EmptyList_ReturnsEmpty()
        {
            // Arrange
            var courseId = Guid.NewGuid();
            _sectionRepositoryMock
                .Setup(r => r.GetByCourseIdAsync(courseId))
                .ReturnsAsync(new List<Section>());

            // Act
            var result = await _iSectionService.GetSectionsByCourseIdAsync(courseId);

            // Assert
            var list = result.ToList();
            Assert.AreEqual(0, list.Count);
            Assert.IsEmpty(list);
            _sectionRepositoryMock.Verify(r => r.GetByCourseIdAsync(courseId), Times.Once);
        }

        // -------- UpdateSectionAsync --------

        // Test 1: Cập nhật Section thành công
        [Test]
        public async Task UpdateSectionAsync_ValidData_UpdatesAndReturnsDto()
        {
            // Arrange
            var id = Guid.NewGuid();
            var entity = new Section
            {
                Id = id,
                CourseId = Guid.NewGuid(),
                Title = "Old Title",
                Description = "Old Description",
                IsActive = true,
                Orders = 1
            };

            var updateDto = new SectionUpdateDto
            {
                Title = "New Title",
                Description = "New Description"
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
            Assert.AreEqual(updateDto.Title, entity.Title);
            Assert.AreEqual(updateDto.Description, entity.Description);
            _sectionRepositoryMock.Verify(r => r.FindByIdAsync(id), Times.Once);
            _sectionRepositoryMock.Verify(r => r.UpdateAsync(entity), Times.Once);
        }

        // Test 2: Cập nhật Section với roleId != 4 - ném UnauthorizedAccessException
        [Test]
        public void UpdateSectionAsync_RoleIdNotFour_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            _currentUserServiceMock.Setup(s => s.RoleId).Returns(3);
            var id = Guid.NewGuid();
            var updateDto = new SectionUpdateDto
            {
                Title = "New Title",
                Description = "New Description"
            };

            // Act & Assert
            var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => _iSectionService.UpdateSectionAsync(id, updateDto));
            Assert.That(ex!.Message, Does.Contain("Chỉ giảng viên mới được cập nhật section"));
            _sectionRepositoryMock.Verify(r => r.FindByIdAsync(It.IsAny<Guid>()), Times.Never);
        }

        // Test 3: Cập nhật Section khi không tìm thấy - trả về null
        [Test]
        public async Task UpdateSectionAsync_NotFound_ReturnsNull()
        {
            // Arrange
            var id = Guid.NewGuid();
            var updateDto = new SectionUpdateDto
            {
                Title = "New Title",
                Description = "New Description"
            };

            _sectionRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync((Section?)null);

            // Act
            var result = await _iSectionService.UpdateSectionAsync(id, updateDto);

            // Assert
            Assert.IsNull(result);
            _sectionRepositoryMock.Verify(r => r.FindByIdAsync(id), Times.Once);
        }

        // Test 4: Cập nhật Section với Title trống - ném ArgumentException
        [Test]
        public void UpdateSectionAsync_EmptyTitle_ThrowsArgumentException()
        {
            // Arrange
            var id = Guid.NewGuid();
            var entity = new Section { Id = id };
            var updateDto = new SectionUpdateDto
            {
                Title = "",
                Description = "Valid Description"
            };

            _sectionRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(entity);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ArgumentException>(() => _iSectionService.UpdateSectionAsync(id, updateDto));
            Assert.That(ex!.ParamName, Is.EqualTo("Title"));
            StringAssert.Contains("không được để trống", ex.Message);
            _sectionRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Section>()), Times.Never);
        }

        // Test 5: Cập nhật Section với Title null - ném ArgumentException
        [Test]
        public void UpdateSectionAsync_NullTitle_ThrowsArgumentException()
        {
            // Arrange
            var id = Guid.NewGuid();
            var entity = new Section { Id = id };
            var updateDto = new SectionUpdateDto
            {
                Title = null!,
                Description = "Valid Description"
            };

            _sectionRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(entity);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ArgumentException>(() => _iSectionService.UpdateSectionAsync(id, updateDto));
            Assert.That(ex!.ParamName, Is.EqualTo("Title"));
            _sectionRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Section>()), Times.Never);
        }

        // Test 6: Cập nhật Section với Description trống - ném ArgumentException
        [Test]
        public void UpdateSectionAsync_EmptyDescription_ThrowsArgumentException()
        {
            // Arrange
            var id = Guid.NewGuid();
            var entity = new Section { Id = id };
            var updateDto = new SectionUpdateDto
            {
                Title = "Valid Title",
                Description = ""
            };

            _sectionRepositoryMock
                .Setup(r => r.FindByIdAsync(id))
                .ReturnsAsync(entity);

            // Act & Assert
            var ex = Assert.ThrowsAsync<ArgumentException>(() => _iSectionService.UpdateSectionAsync(id, updateDto));
            Assert.That(ex!.ParamName, Is.EqualTo("Description"));
            StringAssert.Contains("không được để trống", ex.Message);
            _sectionRepositoryMock.Verify(r => r.UpdateAsync(It.IsAny<Section>()), Times.Never);
        }

        // -------- DeleteSectionAsync --------

        // Test 1: Xóa Section thành công khi section đang active
        [Test]
        public async Task DeleteSectionAsync_Active_SetsInactiveAndReturnsTrue()
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
                .ReturnsAsync(entity);

            // Act
            var result = await _iSectionService.DeleteSectionAsync(id);

            // Assert
            Assert.IsTrue(result);
            Assert.IsFalse(entity.IsActive);
            _sectionRepositoryMock.Verify(r => r.FindByIdAsync(id), Times.Once);
            _sectionRepositoryMock.Verify(r => r.UpdateAsync(entity), Times.Once);
        }

        // Test 2: Xóa Section với roleId != 4 - ném UnauthorizedAccessException
        [Test]
        public void DeleteSectionAsync_RoleIdNotFour_ThrowsUnauthorizedAccessException()
        {
            // Arrange
            _currentUserServiceMock.Setup(s => s.RoleId).Returns(3);
            var id = Guid.NewGuid();

            // Act & Assert
            var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(() => _iSectionService.DeleteSectionAsync(id));
            Assert.That(ex!.Message, Does.Contain("Chỉ giảng viên mới được xoá chương"));
            _sectionRepositoryMock.Verify(r => r.FindByIdAsync(It.IsAny<Guid>()), Times.Never);
        }

        // Test 3: Xóa Section khi không tìm thấy - trả về false
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
            _sectionRepositoryMock.Verify(r => r.FindByIdAsync(id), Times.Once);
        }
    }
}


