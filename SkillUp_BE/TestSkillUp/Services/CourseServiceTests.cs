using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration; // Nếu cần
using Moq;
using NUnit.Framework;
using SkillUp.BussinessObjects.DTOs.Course;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;
using SkillUp.Services.Implementations;
using SkillUp.Services.Interfaces;

namespace TestSkillUp.Services
{
    [TestFixture]
    public class CourseServiceTests
    {
        // Mocks
        private Mock<ICourseRepository> _courseRepoMock = null!;
        private Mock<ILecturerRepository> _lecturerRepoMock = null!;
        private Mock<IAccountRepository> _accountRepoMock = null!;
        private Mock<ICategoryRepository> _categoryRepoMock = null!;
        private Mock<IEnrollmentRepository> _enrollmentRepoMock = null!;
        private Mock<IStudentRepository> _studentRepoMock = null!;
        private Mock<IStudentProgressRepository> _studentProgressRepoMock = null!;

        // Services (Loose)
        private Mock<ICloudinaryService> _cloudinaryServiceMock = null!;
        private Mock<IEmailService> _emailServiceMock = null!;
        private Mock<INotifyService> _notifyServiceMock = null!;
        private Mock<ICurrentUserService> _currentUserServiceMock = null!;

        private CourseService _sut = null!;

        [SetUp]
        public void SetUp()
        {
            _courseRepoMock = new Mock<ICourseRepository>(MockBehavior.Strict);
            _lecturerRepoMock = new Mock<ILecturerRepository>(MockBehavior.Strict);
            _accountRepoMock = new Mock<IAccountRepository>(MockBehavior.Strict);
            _categoryRepoMock = new Mock<ICategoryRepository>(MockBehavior.Strict);
            _enrollmentRepoMock = new Mock<IEnrollmentRepository>(MockBehavior.Strict);
            _studentRepoMock = new Mock<IStudentRepository>(MockBehavior.Strict);
            _studentProgressRepoMock = new Mock<IStudentProgressRepository>(MockBehavior.Strict);

            _cloudinaryServiceMock = new Mock<ICloudinaryService>(MockBehavior.Loose);
            _emailServiceMock = new Mock<IEmailService>(MockBehavior.Loose);
            _notifyServiceMock = new Mock<INotifyService>(MockBehavior.Loose);
            _currentUserServiceMock = new Mock<ICurrentUserService>(MockBehavior.Loose);

            _sut = new CourseService(
                _courseRepoMock.Object, _lecturerRepoMock.Object, _cloudinaryServiceMock.Object,
                _accountRepoMock.Object, _categoryRepoMock.Object, _emailServiceMock.Object,
                _notifyServiceMock.Object, _enrollmentRepoMock.Object, _studentRepoMock.Object,
                _studentProgressRepoMock.Object, _currentUserServiceMock.Object
            );
        }

        #region 1. CreateDraftCourseAsync

        [Test]
        public async Task CreateDraftCourseAsync_HappyPath_ReturnsDraftCourse()
        {
            // Arrange
            var accId = Guid.NewGuid();
            var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var dto = new CreateUpdateCourseDto { Title = "New Course", Image = new Mock<IFormFile>().Object };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lecturer);
            _cloudinaryServiceMock.Setup(c => c.UploadImageAsync(It.IsAny<IFormFile>(), "skillup/courses")).ReturnsAsync("url");

            Course? savedCourse = null;
            _courseRepoMock.Setup(r => r.AddCourseAsync(It.IsAny<Course>()))
                .Callback<Course>(c => savedCourse = c)
                .Returns(Task.CompletedTask);
            _courseRepoMock.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            // Act
            var result = await _sut.CreateDraftCourseAsync(dto, accId);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual("Draft", savedCourse!.Status);
            Assert.AreEqual("url", savedCourse.Image);
            _courseRepoMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Test]
        public void CreateDraftCourseAsync_LecturerNotFound_ThrowsException()
        {
            // Arrange
            var accId = Guid.NewGuid();
            _cloudinaryServiceMock.Setup(c => c.UploadImageAsync(It.IsAny<IFormFile>(), It.IsAny<string>())).ReturnsAsync("url");
            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync((Lecturer?)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() => _sut.CreateDraftCourseAsync(new CreateUpdateCourseDto(), accId));
            StringAssert.Contains("Không tìm thấy giảng viên", ex!.Message);
        }

        [Test]
        public async Task CreateDraftCourseAsync_SaveDbFails_ReturnsNull()
        {
            // Arrange
            var accId = Guid.NewGuid();
            var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lecturer);
            _cloudinaryServiceMock.Setup(c => c.UploadImageAsync(It.IsAny<IFormFile>(), It.IsAny<string>())).ReturnsAsync("url");
            _courseRepoMock.Setup(r => r.AddCourseAsync(It.IsAny<Course>())).Returns(Task.CompletedTask);
            _courseRepoMock.Setup(r => r.SaveChangesAsync()).ReturnsAsync(false); // Save fails

            // Act
            var result = await _sut.CreateDraftCourseAsync(new CreateUpdateCourseDto(), accId);

            // Assert
            Assert.IsNull(result);
        }

        #endregion

        #region 2. DeleteCourseAsync

        [Test]
        public async Task DeleteCourseAsync_HappyPath_SoftDeletesCourse()
        {
            // Arrange
            var courseId = Guid.NewGuid();
            var accId = Guid.NewGuid();
            var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = courseId, LecturerId = lecturer.Id, Status = "Public" };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lecturer);
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(courseId)).ReturnsAsync(course);
            _courseRepoMock.Setup(r => r.UpdateCourse(course));
            _courseRepoMock.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            // Act
            var result = await _sut.DeleteCourseAsync(courseId, accId);

            // Assert
            Assert.IsTrue(result);
            Assert.AreEqual("Unpublish", course.Status);
        }

        [Test]
        public void DeleteCourseAsync_Unauthorized_ThrowsException()
        {
            // Arrange
            var courseId = Guid.NewGuid();
            var accId = Guid.NewGuid();
            var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = courseId, LecturerId = Guid.NewGuid() }; // Khác chủ

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lecturer);
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(courseId)).ReturnsAsync(course);

            // Act & Assert
            Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.DeleteCourseAsync(courseId, accId));
        }

        [Test]
        public void DeleteCourseAsync_CourseNotFound_ThrowsException()
        {
            var accId = Guid.NewGuid();
            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(new Lecturer());
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Course?)null);

            var ex = Assert.ThrowsAsync<Exception>(() => _sut.DeleteCourseAsync(Guid.NewGuid(), accId));
            StringAssert.Contains("Không tìm thấy khoá học", ex!.Message);
        }

        #endregion

        #region 3. UpdateCourseAsync

        [Test]
        public async Task UpdateCourseAsync_HappyPath_UpdatesFields()
        {
            // Arrange
            var courseId = Guid.NewGuid();
            var accId = Guid.NewGuid();
            var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = courseId, LecturerId = lecturer.Id, Title = "Old" };
            var dto = new UpdateCourseDto { Title = "New", Description = "Desc", SubCategoryId = 5 };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lecturer);
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(courseId)).ReturnsAsync(course);
            _courseRepoMock.Setup(r => r.UpdateCourse(course));
            _courseRepoMock.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            // Act
            var result = await _sut.UpdateCourseAsync(dto, courseId, accId);

            // Assert
            Assert.AreEqual("New", course.Title);
            Assert.AreEqual("Desc", course.Description);
            Assert.AreEqual(5, course.SubCategoryId);
        }

        [Test]
        public async Task UpdateCourseAsync_WithImage_UploadsToCloudinary()
        {
            // Arrange
            var courseId = Guid.NewGuid();
            var accId = Guid.NewGuid();
            var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = courseId, LecturerId = lecturer.Id };
            var dto = new UpdateCourseDto { Image = new Mock<IFormFile>().Object };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lecturer);
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(courseId)).ReturnsAsync(course);
            _cloudinaryServiceMock.Setup(c => c.UploadImageAsync(It.IsAny<IFormFile>(), "skillup/courses")).ReturnsAsync("new-url");
            _courseRepoMock.Setup(r => r.UpdateCourse(course));
            _courseRepoMock.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            // Act
            await _sut.UpdateCourseAsync(dto, courseId, accId);

            // Assert
            Assert.AreEqual("new-url", course.Image);
        }

        #endregion

        #region 4. ToggleBanCourseAsync

        [Test]
        public async Task ToggleBanCourseAsync_HappyPath_AdminTogglesStatus()
        {
            // Arrange
            var courseId = Guid.NewGuid();
            var adminId = Guid.NewGuid();
            var admin = new Account { Id = adminId, RoleId = 3 }; // Admin
            var course = new Course { Id = courseId, IsActive = true };

            _accountRepoMock.Setup(r => r.GetByIdAsync(adminId)).ReturnsAsync(admin);
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(courseId)).ReturnsAsync(course);
            _courseRepoMock.Setup(r => r.UpdateCourse(course));
            _courseRepoMock.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            // Act
            var result = await _sut.ToggleBanCourseAsync(courseId, adminId);

            // Assert
            Assert.IsFalse(result); // true -> false
            Assert.IsFalse(course.IsActive);
        }

        [Test]
        public void ToggleBanCourseAsync_NotAdmin_ThrowsUnauthorized()
        {
            var adminId = Guid.NewGuid();
            var user = new Account { Id = adminId, RoleId = 1 }; // Student
            _accountRepoMock.Setup(r => r.GetByIdAsync(adminId)).ReturnsAsync(user);

            Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.ToggleBanCourseAsync(Guid.NewGuid(), adminId));
        }

        #endregion

        #region 5 & 6. GetListCourseBy(Sub)CateId

        [Test]
        public void GetListCourseBySubCateId_EmptyList_ThrowsException()
        {
            // Arrange
            _courseRepoMock.Setup(r => r.GetCoursesBySubCategoryId(1)).ReturnsAsync(new List<Course>());

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() => _sut.GetListCourseBySubCateId(1));
            StringAssert.Contains("Không tìm thấy khóa học nào", ex!.Message);
        }

        [Test]
        public async Task GetListCourseByCateId_HappyPath_ReturnsList()
        {
            // Arrange
            var courses = new List<Course> { new Course { Id = Guid.NewGuid(), Title = "C1", Lecturer = new Lecturer { Account = new Account() } } };
            _courseRepoMock.Setup(r => r.GetCoursesByCategoryId(1)).ReturnsAsync(courses);

            // Act
            var result = await _sut.GetListCourseByCateId(1);

            // Assert
            Assert.AreEqual(1, result.Count);
        }

        #endregion

        #region 7. SearchCoursesAsync

        [Test]
        public async Task SearchCoursesAsync_NoData_ReturnsEmptyList()
        {
            // Arrange
            // SỬA: Thay (List<Course>?)null bằng (List<CourseSummaryDTO>?)null
            _courseRepoMock.Setup(r => r.SearchCoursesAsync("abc", 10))
                           .ReturnsAsync((List<CourseSummaryDTO>?)null);

            // Act
            var result = await _sut.SearchCoursesAsync("abc", 10);

            // Assert
            Assert.IsNotNull(result);
            Assert.IsEmpty(result);
        }

        #endregion

        #region 8. GetAllCourseAsync (Moderator)

        [Test]
        public async Task GetAllCourseAsync_HappyPath_ReturnsMappedDtos()
        {
            // Arrange
            var accId = Guid.NewGuid();
            var admin = new Account { Id = accId, RoleId = 3 };
            var courses = new List<Course>
            {
                new Course
                {
                    Id = Guid.NewGuid(),
                    SubCategory = new SubCategory { Name = "Sub" },
                    Lecturer = new Lecturer { Account = new Account { Fullname = "Lec" } }
                }
            };

            _accountRepoMock.Setup(r => r.GetByIdAsync(accId)).ReturnsAsync(admin);
            _courseRepoMock.Setup(r => r.GetAllCourseAsync()).ReturnsAsync(courses);

            // Act
            var result = await _sut.GetAllCourseAsync(accId);

            // Assert
            Assert.AreEqual(1, result.Count);
            Assert.AreEqual("Sub", result[0].SubCategoryName);
        }

        #endregion

        #region 10. GetCourseDetailsAsync

        [Test]
        public async Task GetCourseDetailsAsync_CourseNotFound_ReturnsNull()
        {
            _courseRepoMock.Setup(r => r.GetCourseWithDetailsAsync(It.IsAny<Guid>())).ReturnsAsync((Course?)null);
            var result = await _sut.GetCourseDetailsAsync(Guid.NewGuid());
            Assert.IsNull(result);
        }

        [Test]
        public async Task GetCourseDetailsAsync_HappyPath_ReturnsDetailDto()
        {
            var courseId = Guid.NewGuid();
            var course = new Course
            {
                Id = courseId,
                Sections = new List<Section>(),
                Lecturer = new Lecturer { Account = new Account() },
                SubCategory = new SubCategory { Category = new Category() }
            };

            _courseRepoMock.Setup(r => r.GetCourseWithDetailsAsync(courseId)).ReturnsAsync(course);

            var result = await _sut.GetCourseDetailsAsync(courseId);
            Assert.IsNotNull(result);
        }

        #endregion

        #region 11. GetCategoryPageAsync

        [Test]
        public async Task GetCategoryPageAsync_HappyPath_ReturnsNavAndCourses()
        {
            // Arrange
            int catId = 1;
            var category = new Category
            {
                Id = catId,
                Name = "Cat1",
                SubCategories = new List<SubCategory> { new SubCategory { Id = 2, Name = "Sub1" } }
            };
            var courses = new List<Course> { new Course { Lecturer = new Lecturer { Account = new Account() } } };

            _categoryRepoMock.Setup(r => r.GetByIdWithSubCategoriesAsync(catId)).ReturnsAsync(category);
            _courseRepoMock.Setup(r => r.GetCoursesByCategoryId(catId)).ReturnsAsync(courses);

            // Act
            var result = await _sut.GetCategoryPageAsync(catId);

            // Assert
            Assert.AreEqual("Cat1", result.MainCategory.Name);
            Assert.AreEqual(1, result.SubCategories.Count);
            Assert.AreEqual(1, result.Courses.Count);
        }

        [Test]
        public void GetCategoryPageAsync_CategoryNotFound_ThrowsException()
        {
            _categoryRepoMock.Setup(r => r.GetByIdWithSubCategoriesAsync(1)).ReturnsAsync((Category?)null);
            Assert.ThrowsAsync<Exception>(() => _sut.GetCategoryPageAsync(1));
        }

        #endregion

        #region 12. SetCoursePriceAsync

        [Test]
        public async Task SetCoursePriceAsync_HappyPath_UpdatesPrice()
        {
            // Arrange
            var courseId = Guid.NewGuid();
            var accId = Guid.NewGuid();
            var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = courseId, LecturerId = lecturer.Id, Price = 0 };
            var dto = new CoursePriceDto { Price = 500000 };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lecturer);
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(courseId)).ReturnsAsync(course);
            _courseRepoMock.Setup(r => r.UpdateCourse(course));
            _courseRepoMock.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            // Act
            var result = await _sut.SetCoursePriceAsync(courseId, dto, accId);

            // Assert
            Assert.IsTrue(result);
            Assert.AreEqual(500000, course.Price);
            Assert.AreEqual(500000, course.OriginalPrice);
        }

        [Test]
        public void SetCoursePriceAsync_NotOwner_ThrowsUnauthorized()
        {
            // Arrange
            var courseId = Guid.NewGuid();
            var accId = Guid.NewGuid();
            var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = courseId, LecturerId = Guid.NewGuid() }; // Khác chủ

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lecturer);
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(courseId)).ReturnsAsync(course);

            // Act & Assert
            Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.SetCoursePriceAsync(courseId, new CoursePriceDto(), accId));
        }

        #endregion

        #region 13. PublishCourseForReviewAsync (Validation Rules)

        [Test]
        public async Task PublishCourseForReviewAsync_HappyPath_StatusToPending()
        {
            // Arrange
            var courseId = Guid.NewGuid();
            var accId = Guid.NewGuid();
            var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course
            {
                Id = courseId,
                LecturerId = lecturer.Id,
                Status = "Draft",
                Title = "Valid",
                Description = "Valid",
                SubCategoryId = 1,
                OriginalPrice = 100,
                Sections = new List<Section>
                {
                    new Section { IsActive = true, Lessons = new List<Lesson> { new Lesson { IsActive = true } }, Quizzes = new List<Quiz>() }
                }
            };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lecturer);
            _courseRepoMock.Setup(r => r.GetCourseWithDetailsAsync(courseId)).ReturnsAsync(course);
            _courseRepoMock.Setup(r => r.UpdateCourse(course));
            _courseRepoMock.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            // Act
            var result = await _sut.PublishCourseForReviewAsync(courseId, accId);

            // Assert
            Assert.IsTrue(result);
            Assert.AreEqual("Pending", course.Status);
        }

        [TestCase("Pending", "đang chờ được duyệt")]
        [TestCase("Public", "đã được xuất bản")]
        public void PublishCourseForReviewAsync_InvalidStatus_ThrowsException(string status, string errorMsg)
        {
            // Arrange
            var courseId = Guid.NewGuid();
            var accId = Guid.NewGuid();
            var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = courseId, LecturerId = lecturer.Id, Status = status };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lecturer);
            _courseRepoMock.Setup(r => r.GetCourseWithDetailsAsync(courseId)).ReturnsAsync(course);

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() => _sut.PublishCourseForReviewAsync(courseId, accId));
            StringAssert.Contains(errorMsg, ex!.Message);
        }

        [Test]
        public void PublishCourseForReviewAsync_MissingBasicInfo_ThrowsException()
        {
            // Arrange
            var courseId = Guid.NewGuid();
            var accId = Guid.NewGuid();
            var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = courseId, LecturerId = lecturer.Id, Status = "Draft", Title = "", Description = "Desc", SubCategoryId = 1 };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lecturer);
            _courseRepoMock.Setup(r => r.GetCourseWithDetailsAsync(courseId)).ReturnsAsync(course);

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() => _sut.PublishCourseForReviewAsync(courseId, accId));
            StringAssert.Contains("Vui lòng hoàn thành thông tin cơ bản", ex!.Message);
        }

        [Test]
        public void PublishCourseForReviewAsync_NoContent_ThrowsException()
        {
            // Arrange
            var courseId = Guid.NewGuid();
            var accId = Guid.NewGuid();
            var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course
            {
                Id = courseId,
                LecturerId = lecturer.Id,
                Status = "Draft",
                Title = "T",
                Description = "D",
                SubCategoryId = 1,
                OriginalPrice = 10,
                Sections = new List<Section>
                {
                    new Section { IsActive = true, Lessons = new List<Lesson>(), Quizzes = new List<Quiz>() } 
                    // Section active nhưng ko có lesson/quiz
                }
            };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lecturer);
            _courseRepoMock.Setup(r => r.GetCourseWithDetailsAsync(courseId)).ReturnsAsync(course);

            // Act & Assert
            var ex = Assert.ThrowsAsync<Exception>(() => _sut.PublishCourseForReviewAsync(courseId, accId));
            StringAssert.Contains("ít nhất một bài học", ex!.Message);
        }

        #endregion
    }
}