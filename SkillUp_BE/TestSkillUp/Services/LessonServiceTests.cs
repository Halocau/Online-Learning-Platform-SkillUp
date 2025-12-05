using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Moq;
using NUnit.Framework;
using SkillUp.BussinessObjects.DTOs.Lesson;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Configuration;
using SkillUp.Services.Common;
using SkillUp.Services.Interfaces;
using LessonSvc = SkillUp.Services.Implementations.LessonService;

namespace TestSkillUp.Services
{
    [TestFixture]
    public class LessonServiceTests
    {
        private Mock<ILessonRepository> _lessonRepositoryMock = null!;
        private Mock<ISectionRepository> _sectionRepositoryMock = null!;
        private Mock<ICourseRepository> _courseRepositoryMock = null!;
        private Mock<ILecturerRepository> _lecturerRepositoryMock = null!;
        private Mock<IStudentRepository> _studentRepositoryMock = null!;
        private Mock<IStudentProgressRepository> _studentProgressRepositoryMock = null!;

        private Mock<FtpVideoUploadService> _ftpVideoUploadServiceMock = null!;
        private Mock<CloudinaryService> _cloudinaryServiceMock = null!;

        private ILessonService _sut = null!; // System Under Test

        [SetUp]
        public void SetUp()
        {
            _lessonRepositoryMock = new Mock<ILessonRepository>(MockBehavior.Strict);
            _sectionRepositoryMock = new Mock<ISectionRepository>(MockBehavior.Strict);
            _courseRepositoryMock = new Mock<ICourseRepository>(MockBehavior.Strict);
            _lecturerRepositoryMock = new Mock<ILecturerRepository>(MockBehavior.Strict);
            _studentRepositoryMock = new Mock<IStudentRepository>(MockBehavior.Strict);
            _studentProgressRepositoryMock = new Mock<IStudentProgressRepository>(MockBehavior.Strict);

            // Các service này là class thường, nên dùng Mock với MockBehavior.Loose
            _ftpVideoUploadServiceMock =
                new Mock<FtpVideoUploadService>(MockBehavior.Loose, new ConfigurationBuilder().Build());

            // Tạo IOptions<CloudinarySettings> giả để constructor không bị null
            var cloudinaryOptions = Options.Create(new CloudinarySettings
            {
                CloudName = "demo",
                ApiKey = "demo-key",
                ApiSecret = "demo-secret"
            });
            _cloudinaryServiceMock =
                new Mock<CloudinaryService>(MockBehavior.Loose, cloudinaryOptions);

            _sut = new LessonSvc(
                _lessonRepositoryMock.Object,
                _sectionRepositoryMock.Object,
                _courseRepositoryMock.Object,
                _lecturerRepositoryMock.Object,
                _ftpVideoUploadServiceMock.Object,
                _cloudinaryServiceMock.Object,
                _studentRepositoryMock.Object,
                _studentProgressRepositoryMock.Object
            );
        }

        // -------- GetAllLessonsAsync --------

        [Test]//1
        public async Task GetAllLessonsAsync_ReturnsMappedDtos()
        {
            // Arrange
            var lessons = new List<Lesson>
            {
                new Lesson
                {
                    Id = Guid.NewGuid(),
                    Title = "Lesson 1",
                    Type = "Video",
                    Description = "Desc",
                    Orders = 1,
                    IsFree = true,
                    IsActive = true,
                    CreatedAt = DateTime.Now.AddDays(-2),
                    UpdatedAt = DateTime.Now.AddDays(-1),
                    Assets = new List<Asset>
                    {
                        new Asset
                        {
                            Id = Guid.NewGuid(),
                            Url = "video-url",
                            FileUrl = "file-url",
                            Contents = "ignored",
                            IsActive = true
                        }
                    }
                }
            };

            _lessonRepositoryMock
                .Setup(r => r.GetAllLessonsAsync())
                .ReturnsAsync(lessons);

            // Act
            var result = await _sut.GetAllLessonsAsync();

            // Assert
            var list = result.ToList();
            Assert.AreEqual(1, list.Count);
            Assert.AreEqual("Lesson 1", list[0].Title);
            Assert.AreEqual("Video", list[0].Type);
            Assert.AreEqual(1d, list[0].Orders);
            Assert.AreEqual(true, list[0].IsFree);
            Assert.AreEqual(true, list[0].IsActive);
            Assert.AreEqual(1, list[0].Assets.Count);
            Assert.AreEqual("video-url", list[0].Assets[0].Url);
        }

        [Test]//1
        public async Task GetAllLessonsAsync_NullRepositoryResponse_ReturnsEmptyList()
        {
            // Arrange
            _lessonRepositoryMock
                .Setup(r => r.GetAllLessonsAsync())
                .ReturnsAsync((IEnumerable<Lesson>?)null);

            // Act
            var result = await _sut.GetAllLessonsAsync();

            // Assert
            Assert.IsNotNull(result);
            Assert.IsEmpty(result);
            _lessonRepositoryMock.Verify(r => r.GetAllLessonsAsync(), Times.Once);
        }

        // -------- GetLessonByIdAsync --------

        [Test]//1
        public async Task GetLessonByIdAsync_LessonNotFound_ReturnsNull()
        {
            // Arrange
            var id = Guid.NewGuid();
            _lessonRepositoryMock
                .Setup(r => r.GetLessonWithDetailsAsync(id))
                .ReturnsAsync((Lesson?)null);

            // Act
            var res = await _sut.GetLessonByIdAsync(id);

            // Assert
            Assert.IsNull(res);
            _lessonRepositoryMock.Verify(r => r.GetLessonWithDetailsAsync(id), Times.Once);
        }

        [Test]//1
        public async Task GetLessonByIdAsync_LessonFound_ReturnsMappedDto()
        {
            // Arrange
            var id = Guid.NewGuid();
            var sectionId = Guid.NewGuid();
            var lesson = new Lesson
            {
                Id = id,
                SectionId = sectionId,
                Section = new Section { Id = sectionId, Title = "Section 1" },
                Title = "Lesson 1",
                Type = "Text",
                Description = "Desc",
                Orders = 1,
                IsFree = true,
                IsActive = true,
                CreatedAt = DateTime.Now.AddDays(-1),
                UpdatedAt = DateTime.Now,
                Assets = new List<Asset>
                {
                    new Asset
                    {
                        Id = Guid.NewGuid(),
                        Contents = "content text",
                        FileUrl = "file-url",
                        Url = null,
                        IsActive = true
                    }
                }
            };

            _lessonRepositoryMock
                .Setup(r => r.GetLessonWithDetailsAsync(id))
                .ReturnsAsync(lesson);

            // Act
            var res = await _sut.GetLessonByIdAsync(id);

            // Assert
            Assert.IsNotNull(res);
            Assert.AreEqual(lesson.Id, res!.Id);
            Assert.AreEqual(lesson.SectionId, res.SectionId);
            Assert.AreEqual(lesson.Section!.Title, res.SectionTitle);
            Assert.AreEqual(lesson.Title, res.Title);
            Assert.AreEqual(lesson.Description, res.Description);
            Assert.AreEqual(lesson.Orders, res.Orders);
            Assert.AreEqual(lesson.IsFree, res.IsFree);
            Assert.AreEqual(lesson.IsActive, res.IsActive);
            Assert.AreEqual(lesson.Assets.First().Contents, res.TextContent);
        }

        // -------- GetLessonsBySectionIdAsync --------

        [Test]//1
        public void GetLessonsBySectionIdAsync_SectionNotFound_Throws()
        {
            // Arrange
            var sectionId = Guid.NewGuid();

            _sectionRepositoryMock
                .Setup(r => r.GetSectionByIdAsync(sectionId))
                .ReturnsAsync((Section?)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() =>
                _sut.GetLessonsBySectionIdAsync(sectionId));

            StringAssert.Contains("Không tìm thấy section", ex!.Message);

            _lessonRepositoryMock.Verify(r => r.GetLessonsBySectionIdAsync(It.IsAny<Guid>()), Times.Never);
        }

        [Test]//1
        public async Task GetLessonsBySectionIdAsync_SectionExists_ReturnsMappedLessons()
        {
            // Arrange
            var sectionId = Guid.NewGuid();
            var lessonId = Guid.NewGuid();
            var section = new Section { Id = sectionId, Title = "Section title" };
            var lessons = new List<Lesson>
            {
                new Lesson
                {
                    Id = lessonId,
                    SectionId = sectionId,
                    Section = section,
                    Title = "Lesson title",
                    Type = "Text",
                    Description = "Desc",
                    Orders = 2,
                    IsFree = true,
                    IsActive = true,
                    CreatedAt = DateTime.Now.AddDays(-3),
                    UpdatedAt = DateTime.Now.AddDays(-1),
                    Assets = new List<Asset>
                    {
                        new Asset
                        {
                            Id = Guid.NewGuid(),
                            Contents = "content",
                            FileUrl = "file",
                            IsActive = true
                        }
                    }
                }
            };

            _sectionRepositoryMock
                .Setup(r => r.GetSectionByIdAsync(sectionId))
                .ReturnsAsync(section);

            _lessonRepositoryMock
                .Setup(r => r.GetLessonsBySectionIdAsync(sectionId))
                .ReturnsAsync(lessons);

            // Act
            var result = await _sut.GetLessonsBySectionIdAsync(sectionId);

            // Assert
            var list = result.ToList();
            Assert.AreEqual(1, list.Count);
            Assert.AreEqual(lessonId, list[0].Id);
            Assert.AreEqual(sectionId, list[0].SectionId);
            Assert.AreEqual("Section title", list[0].SectionTitle);
            Assert.AreEqual("Lesson title", list[0].Title);
            Assert.AreEqual("content", list[0].TextContent);

            _sectionRepositoryMock.Verify(r => r.GetSectionByIdAsync(sectionId), Times.Once);
            _lessonRepositoryMock.Verify(r => r.GetLessonsBySectionIdAsync(sectionId), Times.Once);
        }

        // -------- CreateLessonAsync (Text) --------

        [Test]
        public void CreateLessonAsync_InvalidType_ThrowsValidationException()
        {
            // Arrange
            var dto = new CreateLessonDto
            {
                Type = "Other", // không phải Video/Text
                SectionId = Guid.NewGuid(),
                LessonOrder = 1,
                Title = "Invalid"
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(() =>
                _sut.CreateLessonAsync(dto, Guid.NewGuid()));
        }

        [Test]
        public void CreateLessonAsync_TextWithoutContent_ThrowsValidationException()
        {
            // Arrange
            var dto = new CreateLessonDto
            {
                Type = "Text",
                SectionId = Guid.NewGuid(),
                LessonOrder = 1,
                Title = "Lesson",
                Content = null
            };

            // Act & Assert
            Assert.ThrowsAsync<ValidationException>(() =>
                _sut.CreateLessonAsync(dto, Guid.NewGuid()));
        }

        [Test]
        public async Task CreateLessonAsync_TextLesson_Success_CreatesLessonWithAsset()
        {
            // Arrange
            var sectionId = Guid.NewGuid();
            var courseId = Guid.NewGuid();
            var accountId = Guid.NewGuid();
            var lecturerId = Guid.NewGuid();

            var dto = new CreateLessonDto
            {
                SectionId = sectionId,
                Title = "New Lesson",
                Type = "Text",
                Description = "Desc",
                LessonOrder = 1,
                IsFree = true,
                Content = "Lesson content",
                FileUrl = null
            };

            var section = new Section
            {
                Id = sectionId,
                CourseId = courseId
            };

            var course = new Course
            {
                Id = courseId,
                LecturerId = lecturerId
            };

            var lecturer = new Lecturer
            {
                Id = lecturerId,
                AccountId = accountId
            };

            Lesson? createdLesson = null;

            _sectionRepositoryMock
                .Setup(r => r.GetSectionByIdAsync(sectionId))
                .ReturnsAsync(section);

            _courseRepositoryMock
                .Setup(r => r.GetCourseByIdAsync(courseId))
                .ReturnsAsync(course);

            _lecturerRepositoryMock
                .Setup(r => r.GetLecturerByAccountIdAsync(accountId))
                .ReturnsAsync(lecturer);

            _lessonRepositoryMock
                .Setup(r => r.AddLessonAsync(It.IsAny<Lesson>()))
                .Callback<Lesson>(l => createdLesson = l)
                .Returns(Task.CompletedTask);

            _lessonRepositoryMock
                .Setup(r => r.SaveChangesAsync())
                .ReturnsAsync(true);

            _lessonRepositoryMock
                .Setup(r => r.GetLessonWithDetailsAsync(It.IsAny<Guid>()))
                .ReturnsAsync(() => createdLesson!);

            // Act
            var res = await _sut.CreateLessonAsync(dto, accountId);

            // Assert
            Assert.IsNotNull(res);
            Assert.AreEqual(dto.Title, res.Title);
            Assert.AreEqual(dto.Description, res.Description);
            Assert.AreEqual(dto.LessonOrder, res.Orders);
            Assert.AreEqual(dto.IsFree, res.IsFree);
            Assert.AreEqual(dto.Content, res.TextContent);

            _sectionRepositoryMock.Verify(r => r.GetSectionByIdAsync(sectionId), Times.Once);
            _courseRepositoryMock.Verify(r => r.GetCourseByIdAsync(courseId), Times.Once);
            _lecturerRepositoryMock.Verify(r => r.GetLecturerByAccountIdAsync(accountId), Times.Once);
            _lessonRepositoryMock.Verify(r => r.AddLessonAsync(It.IsAny<Lesson>()), Times.Once);
            _lessonRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        // -------- DeleteLessonAsync --------

        [Test]
        public void DeleteLessonAsync_AlreadyDeleted_Throws()
        {
            // Arrange
            var lessonId = Guid.NewGuid();
            var accountId = Guid.NewGuid();

            var lesson = new Lesson
            {
                Id = lessonId,
                SectionId = Guid.NewGuid(),
                IsActive = false
            };

            _lessonRepositoryMock
                .Setup(r => r.GetLessonByIdAsync(lessonId))
                .ReturnsAsync(lesson);

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() =>
                _sut.DeleteLessonAsync(lessonId, accountId));

            StringAssert.Contains("đã được xoá từ trước", ex!.Message);

            _lessonRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Never);
        }

        [Test]
        public async Task DeleteLessonAsync_ValidRequest_SoftDeletesLessonAndAssets()
        {
            // Arrange
            var lessonId = Guid.NewGuid();
            var accountId = Guid.NewGuid();
            var sectionId = Guid.NewGuid();
            var courseId = Guid.NewGuid();
            var lecturerId = Guid.NewGuid();

            var lesson = new Lesson
            {
                Id = lessonId,
                SectionId = sectionId,
                IsActive = true,
                UpdatedAt = DateTime.MinValue,
                Assets = new List<Asset>
                {
                    new Asset { Id = Guid.NewGuid(), IsActive = true },
                    new Asset { Id = Guid.NewGuid(), IsActive = true }
                }
            };

            var section = new Section { Id = sectionId, CourseId = courseId };
            var course = new Course { Id = courseId, LecturerId = lecturerId };
            var lecturer = new Lecturer { Id = lecturerId, AccountId = accountId };

            _lessonRepositoryMock
                .Setup(r => r.GetLessonByIdAsync(lessonId))
                .ReturnsAsync(lesson);

            _sectionRepositoryMock
                .Setup(r => r.GetSectionByIdAsync(sectionId))
                .ReturnsAsync(section);

            _courseRepositoryMock
                .Setup(r => r.GetCourseByIdAsync(courseId))
                .ReturnsAsync(course);

            _lecturerRepositoryMock
                .Setup(r => r.GetLecturerByAccountIdAsync(accountId))
                .ReturnsAsync(lecturer);

            _lessonRepositoryMock
                .Setup(r => r.SaveChangesAsync())
                .ReturnsAsync(true);

            _lessonRepositoryMock
                .Setup(r => r.UpdateLesson(lesson));

            // Act
            var result = await _sut.DeleteLessonAsync(lessonId, accountId);

            // Assert
            Assert.IsTrue(result);
            Assert.IsFalse(lesson.IsActive);
            Assert.IsTrue(lesson.Assets.All(a => a.IsActive == false));

            _lessonRepositoryMock.Verify(r => r.UpdateLesson(lesson), Times.Once);
            _lessonRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        // -------- MarkLessonAsCompletedAsync --------

        [Test]
        public void MarkLessonAsCompletedAsync_StudentNotFound_Throws()
        {
            // Arrange
            var lessonId = Guid.NewGuid();
            var accountId = Guid.NewGuid();

            _studentRepositoryMock
                .Setup(r => r.GetByAccountIdAsync(accountId))
                .ReturnsAsync((Student?)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() =>
                _sut.MarkLessonAsCompletedAsync(lessonId, accountId));

            StringAssert.Contains("Không tìm thấy sinh viên", ex!.Message);
        }

        [Test]
        public void MarkLessonAsCompletedAsync_LessonNotFound_Throws()
        {
            // Arrange
            var lessonId = Guid.NewGuid();
            var accountId = Guid.NewGuid();

            var student = new Student
            {
                Id = Guid.NewGuid(),
                AccountId = accountId
            };

            _studentRepositoryMock
                .Setup(r => r.GetByAccountIdAsync(accountId))
                .ReturnsAsync(student);

            _lessonRepositoryMock
                .Setup(r => r.GetByIdAsync(lessonId))
                .ReturnsAsync((Lesson?)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() =>
                _sut.MarkLessonAsCompletedAsync(lessonId, accountId));

            StringAssert.Contains("Không tìm thấy bài học", ex!.Message);
        }

        [Test]
        public async Task MarkLessonAsCompletedAsync_NewProgress_CreatesStudentProgress()
        {
            // Arrange
            var lessonId = Guid.NewGuid();
            var accountId = Guid.NewGuid();
            var studentId = Guid.NewGuid();
            var courseId = Guid.NewGuid();

            var student = new Student
            {
                Id = studentId,
                AccountId = accountId
            };

            var lesson = new Lesson
            {
                Id = lessonId,
                SectionId = Guid.NewGuid(),
                Section = new Section
                {
                    Id = Guid.NewGuid(),
                    CourseId = courseId
                }
            };

            _studentRepositoryMock
                .Setup(r => r.GetByAccountIdAsync(accountId))
                .ReturnsAsync(student);

            _lessonRepositoryMock
                .Setup(r => r.GetByIdAsync(lessonId))
                .ReturnsAsync(lesson);

            _studentProgressRepositoryMock
                .Setup(r => r.GetByStudentAndLessonAsync(studentId, lessonId))
                .ReturnsAsync((StudentProgress?)null);

            StudentProgress? createdProgress = null;

            _studentProgressRepositoryMock
                .Setup(r => r.AddAsync(It.IsAny<StudentProgress>()))
                .Callback<StudentProgress>(p => createdProgress = p)
                .Returns(Task.CompletedTask);

            _studentProgressRepositoryMock
                .Setup(r => r.SaveChangesAsync())
                .ReturnsAsync(true);

            // Act
            var result = await _sut.MarkLessonAsCompletedAsync(lessonId, accountId);

            // Assert
            Assert.IsTrue(result);
            Assert.IsNotNull(createdProgress);
            Assert.AreEqual(studentId, createdProgress!.StudentId);
            Assert.AreEqual(lessonId, createdProgress.LessonId);
            Assert.AreEqual(courseId, createdProgress.CourseId);
            Assert.IsTrue(createdProgress.IsCompleted);

            _studentProgressRepositoryMock.Verify(r => r.AddAsync(It.IsAny<StudentProgress>()), Times.Once);
            _studentProgressRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Test]
        public async Task MarkLessonAsCompletedAsync_ExistingProgress_UpdatesIsCompleted()
        {
            // Arrange
            var lessonId = Guid.NewGuid();
            var accountId = Guid.NewGuid();
            var studentId = Guid.NewGuid();
            var courseId = Guid.NewGuid();

            var student = new Student
            {
                Id = studentId,
                AccountId = accountId
            };

            var lesson = new Lesson
            {
                Id = lessonId,
                SectionId = Guid.NewGuid(),
                Section = new Section
                {
                    Id = Guid.NewGuid(),
                    CourseId = courseId
                }
            };

            var progress = new StudentProgress
            {
                Id = Guid.NewGuid(),
                StudentId = studentId,
                LessonId = lessonId,
                CourseId = courseId,
                IsCompleted = false
            };

            _studentRepositoryMock
                .Setup(r => r.GetByAccountIdAsync(accountId))
                .ReturnsAsync(student);

            _lessonRepositoryMock
                .Setup(r => r.GetByIdAsync(lessonId))
                .ReturnsAsync(lesson);

            _studentProgressRepositoryMock
                .Setup(r => r.GetByStudentAndLessonAsync(studentId, lessonId))
                .ReturnsAsync(progress);

            _studentProgressRepositoryMock
                .Setup(r => r.SaveChangesAsync())
                .ReturnsAsync(true);

            // Act
            var result = await _sut.MarkLessonAsCompletedAsync(lessonId, accountId);

            // Assert
            Assert.IsTrue(result);
            Assert.IsTrue(progress.IsCompleted);
            _studentProgressRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        // -------- TrackLessonViewAsync --------

        [Test]
        public async Task TrackLessonViewAsync_NewLessonView_CreatesProgressWithIsCompletedFalse()
        {
            // Arrange
            var lessonId = Guid.NewGuid();
            var accountId = Guid.NewGuid();
            var studentId = Guid.NewGuid();
            var courseId = Guid.NewGuid();

            var student = new Student
            {
                Id = studentId,
                AccountId = accountId
            };

            var lesson = new Lesson
            {
                Id = lessonId,
                SectionId = Guid.NewGuid(),
                Section = new Section
                {
                    Id = Guid.NewGuid(),
                    CourseId = courseId
                }
            };

            _studentRepositoryMock
                .Setup(r => r.GetByAccountIdAsync(accountId))
                .ReturnsAsync(student);

            _lessonRepositoryMock
                .Setup(r => r.GetByIdAsync(lessonId))
                .ReturnsAsync(lesson);

            _studentProgressRepositoryMock
                .Setup(r => r.GetByStudentAndLessonAsync(studentId, lessonId))
                .ReturnsAsync((StudentProgress?)null);

            StudentProgress? created = null;

            _studentProgressRepositoryMock
                .Setup(r => r.AddAsync(It.IsAny<StudentProgress>()))
                .Callback<StudentProgress>(p => created = p)
                .Returns(Task.CompletedTask);

            _studentProgressRepositoryMock
                .Setup(r => r.SaveChangesAsync())
                .ReturnsAsync(true);

            // Act
            await _sut.TrackLessonViewAsync(lessonId, accountId);

            // Assert
            Assert.IsNotNull(created);
            Assert.AreEqual(studentId, created!.StudentId);
            Assert.AreEqual(lessonId, created.LessonId);
            Assert.AreEqual(courseId, created.CourseId);
            Assert.IsFalse(created.IsCompleted);

            _studentProgressRepositoryMock.Verify(r => r.AddAsync(It.IsAny<StudentProgress>()), Times.Once);
            _studentProgressRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        // -------- GetActiveLessonsAsync --------

        [Test]
        public async Task GetActiveLessonsAsync_FiltersInactiveAssets()
        {
            // Arrange
            var lessons = new List<Lesson>
            {
                new Lesson
                {
                    Id = Guid.NewGuid(),
                    Title = "Active lesson",
                    Type = "Video",
                    Description = "Desc",
                    Orders = 1,
                    IsFree = true,
                    CreatedAt = DateTime.Now.AddDays(-2),
                    UpdatedAt = DateTime.Now.AddDays(-1),
                    Assets = new List<Asset>
                    {
                        new Asset { Id = Guid.NewGuid(), Url = "keep-url", IsActive = true },
                        new Asset { Id = Guid.NewGuid(), Url = "drop-url", IsActive = false }
                    }
                }
            };

            _lessonRepositoryMock
                .Setup(r => r.GetActiveLessonsAsync())
                .ReturnsAsync(lessons);

            // Act
            var result = await _sut.GetActiveLessonsAsync();

            // Assert
            var list = result.ToList();
            Assert.AreEqual(1, list.Count);
            Assert.AreEqual("Active lesson", list[0].Title);
            Assert.AreEqual(1, list[0].Assets.Count); // inactive asset filtered out
            Assert.AreEqual("keep-url", list[0].Assets[0].Url);

            _lessonRepositoryMock.Verify(r => r.GetActiveLessonsAsync(), Times.Once);
        }
    }
}


