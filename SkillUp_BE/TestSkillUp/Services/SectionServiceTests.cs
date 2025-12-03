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

namespace TestSkillUp.Services
{
    [TestFixture]
    public class SectionServiceTests
    {
        private Mock<ISectionRepository> _sectionRepositoryMock = null!;
        private Mock<ILessonRepository> _lessonRepositoryMock = null!;
        private Mock<IQuizRepository> _quizRepositoryMock = null!;

        private ISectionService _iSectionService = null!; // System Under Test

        [SetUp]
        public void SetUp()
        {
            _sectionRepositoryMock = new Mock<ISectionRepository>(MockBehavior.Strict);
            _lessonRepositoryMock = new Mock<ILessonRepository>(MockBehavior.Strict);
            _quizRepositoryMock = new Mock<IQuizRepository>(MockBehavior.Strict);

            _iSectionService = new SectionService(
                _sectionRepositoryMock.Object,
                _lessonRepositoryMock.Object,
                _quizRepositoryMock.Object,
                context: null!
            );
        }

        // -------- CreateSectionAsync --------
        // Kiểm tra tạo Section với Title trống thì ném ArgumentException
        [Test]
        public void CreateSectionAsync_EmptyTitle_ThrowsArgumentException()
        {
            var dto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "",
                Description = "Desc",
                Orders = 1
            };

            Assert.ThrowsAsync<ArgumentException>(() => _iSectionService.CreateSectionAsync(dto));
            _sectionRepositoryMock.Verify(r => r.CreateAsync(It.IsAny<Section>()), Times.Never);
        }

        // Khi repository CreateAsync ném exception thì service cũng ném ra (không nuốt lỗi)
        [Test]
        public void CreateSectionAsync_RepositoryThrows_PropagatesException()
        {
            // Arrange
            var createDto = new SectionCreateDto
            {
                CourseId = Guid.NewGuid(),
                Title = "Section 1",
                Description = "Desc",
                Orders = 1
            };

            _sectionRepositoryMock
                .Setup(r => r.CreateAsync(It.IsAny<Section>()))
                .ThrowsAsync(new Exception("DB error"));

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() => _iSectionService.CreateSectionAsync(createDto));
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


