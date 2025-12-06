using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http; // Cần cài NuGet: Microsoft.AspNetCore.Http.Features
using Moq; // Cần cài NuGet: Moq
using NUnit.Framework; // Cần cài NuGet: NUnit
using SkillUp.BussinessObjects.DTOs.Course;
using SkillUp.BussinessObjects.DTOs.CourseByCategoryPage;
using SkillUp.BussinessObjects.DTOs.Section;
using SkillUp.BussinessObjects.DTOs.StudentCourse;
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
        // --- MOCKS ---
        private Mock<ICourseRepository> _courseRepoMock;
        private Mock<ILecturerRepository> _lecturerRepoMock;
        private Mock<IAccountRepository> _accountRepoMock;
        private Mock<ICategoryRepository> _categoryRepoMock;
        private Mock<IEnrollmentRepository> _enrollmentRepoMock;
        private Mock<IStudentRepository> _studentRepoMock;
        private Mock<IStudentProgressRepository> _studentProgressRepoMock;
        private Mock<ICloudinaryService> _cloudinaryServiceMock;
        private Mock<IEmailService> _emailServiceMock;
        private Mock<INotifyService> _notifyServiceMock;
        private Mock<ICurrentUserService> _currentUserServiceMock;

        private CourseService _sut; // System Under Test

        [SetUp]
        public void SetUp()
        {
            _courseRepoMock = new Mock<ICourseRepository>();
            _lecturerRepoMock = new Mock<ILecturerRepository>();
            _accountRepoMock = new Mock<IAccountRepository>();
            _categoryRepoMock = new Mock<ICategoryRepository>();
            _enrollmentRepoMock = new Mock<IEnrollmentRepository>();
            _studentRepoMock = new Mock<IStudentRepository>();
            _studentProgressRepoMock = new Mock<IStudentProgressRepository>();
            _cloudinaryServiceMock = new Mock<ICloudinaryService>();
            _emailServiceMock = new Mock<IEmailService>();
            _notifyServiceMock = new Mock<INotifyService>();
            _currentUserServiceMock = new Mock<ICurrentUserService>();

            _sut = new CourseService(
                _courseRepoMock.Object, _lecturerRepoMock.Object, _cloudinaryServiceMock.Object,
                _accountRepoMock.Object, _categoryRepoMock.Object, _emailServiceMock.Object,
                _notifyServiceMock.Object, _enrollmentRepoMock.Object, _studentRepoMock.Object,
                _studentProgressRepoMock.Object, _currentUserServiceMock.Object
            );
        }

        // ==========================================
        // 1. CreateDraftCourseAsync
        // ==========================================
        [Test]
        public async Task CreateDraftCourseAsync_Success_ReturnsDto()
        {
            var accId = Guid.NewGuid();
            var lecturer = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var dto = new CreateUpdateCourseDto { Title = "New", SubCategoryId = 1, Image = new Mock<IFormFile>().Object };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lecturer);
            _cloudinaryServiceMock.Setup(c => c.UploadImageAsync(It.IsAny<IFormFile>(), "skillup/courses")).ReturnsAsync("url");
            _courseRepoMock.Setup(r => r.AddCourseAsync(It.IsAny<Course>())).Returns(Task.CompletedTask);
            _courseRepoMock.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            var result = await _sut.CreateDraftCourseAsync(dto, accId);
            Assert.IsNotNull(result);
            Assert.AreEqual("Draft", result.Status);
        }

        [Test]
        public void CreateDraftCourseAsync_LecturerNotFound_Throws()
        {
            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(It.IsAny<Guid>())).ReturnsAsync((Lecturer)null);
            _cloudinaryServiceMock.Setup(c => c.UploadImageAsync(It.IsAny<IFormFile>(), It.IsAny<string>())).ReturnsAsync("url");
            var ex = Assert.ThrowsAsync<Exception>(() => _sut.CreateDraftCourseAsync(new CreateUpdateCourseDto(), Guid.NewGuid()));
            Assert.AreEqual("Không tìm thấy giảng viên cho tài khoản này!", ex.Message);
        }

        [Test]
        public async Task CreateDraftCourseAsync_SaveFail_ReturnsNull()
        {
            var accId = Guid.NewGuid();
            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(new Lecturer());
            _cloudinaryServiceMock.Setup(c => c.UploadImageAsync(It.IsAny<IFormFile>(), It.IsAny<string>())).ReturnsAsync("url");
            _courseRepoMock.Setup(r => r.SaveChangesAsync()).ReturnsAsync(false); // Save Failed

            var result = await _sut.CreateDraftCourseAsync(new CreateUpdateCourseDto(), accId);
            Assert.IsNull(result);
        }

        // ==========================================
        // 2. DeleteCourseAsync
        // ==========================================
        [Test]
        public async Task DeleteCourseAsync_Success()
        {
            var cid = Guid.NewGuid(); var accId = Guid.NewGuid();
            var lec = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = cid, LecturerId = lec.Id };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lec);
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(cid)).ReturnsAsync(course);
            _courseRepoMock.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            Assert.IsTrue(await _sut.DeleteCourseAsync(cid, accId));
            Assert.AreEqual("Unpublish", course.Status);
        }

        [Test]
        public void DeleteCourseAsync_LecturerNotFound_Throws()
        {
            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(It.IsAny<Guid>())).ReturnsAsync((Lecturer)null);
            Assert.ThrowsAsync<Exception>(() => _sut.DeleteCourseAsync(Guid.NewGuid(), Guid.NewGuid()));
        }

        [Test]
        public void DeleteCourseAsync_CourseNotFound_Throws()
        {
            var accId = Guid.NewGuid();
            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(new Lecturer());
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Course)null);
            var ex = Assert.ThrowsAsync<Exception>(() => _sut.DeleteCourseAsync(Guid.NewGuid(), accId));
            Assert.AreEqual("Không tìm thấy khoá học!", ex.Message);
        }

        [Test]
        public void DeleteCourseAsync_Unauthorized_Throws()
        {
            var accId = Guid.NewGuid();
            var lec = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = Guid.NewGuid(), LecturerId = Guid.NewGuid() }; // Diff ID
            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lec);
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(course.Id)).ReturnsAsync(course);
            Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.DeleteCourseAsync(course.Id, accId));
        }

        // ==========================================
        // 3. UpdateCourseAsync
        // ==========================================
        [Test]
        public async Task UpdateCourseAsync_Success()
        {
            var cid = Guid.NewGuid(); var accId = Guid.NewGuid();
            var lec = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = cid, LecturerId = lec.Id };
            var dto = new UpdateCourseDto { Title = "New" };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lec);
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(cid)).ReturnsAsync(course);
            _courseRepoMock.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            var res = await _sut.UpdateCourseAsync(dto, cid, accId);
            Assert.AreEqual("New", course.Title);
        }

        [Test]
        public async Task UpdateCourseAsync_Success_WithImage()
        {
            var cid = Guid.NewGuid(); var accId = Guid.NewGuid();
            var lec = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = cid, LecturerId = lec.Id };
            var dto = new UpdateCourseDto { Image = new Mock<IFormFile>().Object };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lec);
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(cid)).ReturnsAsync(course);
            _cloudinaryServiceMock.Setup(c => c.UploadImageAsync(It.IsAny<IFormFile>(), "skillup/courses")).ReturnsAsync("new-img");
            _courseRepoMock.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            await _sut.UpdateCourseAsync(dto, cid, accId);
            Assert.AreEqual("new-img", course.Image);
        }

        [Test]
        public void UpdateCourseAsync_Unauthorized_Throws()
        {
            var accId = Guid.NewGuid();
            var lec = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = Guid.NewGuid(), LecturerId = Guid.NewGuid() };
            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lec);
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(course.Id)).ReturnsAsync(course);
            Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.UpdateCourseAsync(new UpdateCourseDto(), course.Id, accId));
        }

        // ==========================================
        // 4. ToggleBanCourseAsync
        // ==========================================
        [Test]
        public async Task ToggleBanCourseAsync_Success_Ban()
        {
            var cid = Guid.NewGuid(); var adminId = Guid.NewGuid();
            var course = new Course { Id = cid, IsActive = true };
            _accountRepoMock.Setup(r => r.GetByIdAsync(adminId)).ReturnsAsync(new Account { RoleId = 3 });
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(cid)).ReturnsAsync(course);
            _courseRepoMock.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            var res = await _sut.ToggleBanCourseAsync(cid, adminId);
            Assert.IsFalse(res); // True -> False
            Assert.IsFalse(course.IsActive);
        }

        [Test]
        public async Task ToggleBanCourseAsync_Success_Unban()
        {
            var cid = Guid.NewGuid(); var adminId = Guid.NewGuid();
            var course = new Course { Id = cid, IsActive = false };
            _accountRepoMock.Setup(r => r.GetByIdAsync(adminId)).ReturnsAsync(new Account { RoleId = 3 });
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(cid)).ReturnsAsync(course);
            _courseRepoMock.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            var res = await _sut.ToggleBanCourseAsync(cid, adminId);
            Assert.IsTrue(res); // False -> True
            Assert.IsTrue(course.IsActive);
        }

        [Test]
        public void ToggleBanCourseAsync_NotAdmin_Throws()
        {
            var adminId = Guid.NewGuid();
            _accountRepoMock.Setup(r => r.GetByIdAsync(adminId)).ReturnsAsync(new Account { RoleId = 1 });
            Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.ToggleBanCourseAsync(Guid.NewGuid(), adminId));
        }

        [Test]
        public void ToggleBanCourseAsync_AdminNotFound_Throws()
        {
            _accountRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Account)null);
            var ex = Assert.ThrowsAsync<Exception>(() => _sut.ToggleBanCourseAsync(Guid.NewGuid(), Guid.NewGuid()));
            Assert.AreEqual("Không tìm thấy tài khoản quản trị viên!", ex.Message);
        }

        [Test]
        public async Task ToggleBanCourseAsync_SaveDbFail_Throws()
        {
            var cid = Guid.NewGuid(); var adminId = Guid.NewGuid();
            _accountRepoMock.Setup(r => r.GetByIdAsync(adminId)).ReturnsAsync(new Account { RoleId = 3 });
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(cid)).ReturnsAsync(new Course { IsActive = true });
            _courseRepoMock.Setup(r => r.SaveChangesAsync()).ReturnsAsync(false); // Fail

            var ex = Assert.ThrowsAsync<Exception>(() => _sut.ToggleBanCourseAsync(cid, adminId));
            Assert.AreEqual("Lưu thay đổi thất bại.", ex.Message);
        }

        // ==========================================
        // 5. GetListCourseBySubCateId
        // ==========================================
        [Test]
        public async Task GetListCourseBySubCateId_Success()
        {
            _courseRepoMock.Setup(r => r.GetCoursesBySubCategoryId(1)).ReturnsAsync(new List<Course> { new Course() });
            var res = await _sut.GetListCourseBySubCateId(1);
            Assert.IsNotEmpty(res);
        }

        [Test]
        public void GetListCourseBySubCateId_Empty_Throws()
        {
            _courseRepoMock.Setup(r => r.GetCoursesBySubCategoryId(1)).ReturnsAsync(new List<Course>());
            Assert.ThrowsAsync<Exception>(() => _sut.GetListCourseBySubCateId(1));
        }

        // ==========================================
        // 6. GetListCourseByCateId
        // ==========================================
        [Test]
        public async Task GetListCourseByCateId_Success()
        {
            _courseRepoMock.Setup(r => r.GetCoursesByCategoryId(1)).ReturnsAsync(new List<Course> { new Course() });
            var res = await _sut.GetListCourseByCateId(1);
            Assert.IsNotEmpty(res);
        }

        [Test]
        public void GetListCourseByCateId_Empty_Throws()
        {
            _courseRepoMock.Setup(r => r.GetCoursesByCategoryId(1)).ReturnsAsync(new List<Course>());
            Assert.ThrowsAsync<Exception>(() => _sut.GetListCourseByCateId(1));
        }

        // ==========================================
        // 7. SearchCoursesAsync
        // ==========================================
        [Test]
        public async Task SearchCoursesAsync_Success()
        {
            _courseRepoMock.Setup(r => r.SearchCoursesAsync("a", 10)).ReturnsAsync(new List<CourseSummaryDTO> { new CourseSummaryDTO() });
            var res = await _sut.SearchCoursesAsync("a", 10);
            Assert.IsNotEmpty(res);
        }

        [Test]
        public async Task SearchCoursesAsync_Null_ReturnsEmpty()
        {
            _courseRepoMock.Setup(r => r.SearchCoursesAsync("a", 10)).ReturnsAsync((List<CourseSummaryDTO>)null);
            var res = await _sut.SearchCoursesAsync("a", 10);
            Assert.IsEmpty(res);
        }

        // ==========================================
        // 8. GetAllCourseAsync (Moderator)
        // ==========================================
        [Test]
        public async Task GetAllCourseAsync_Success()
        {
            var modId = Guid.NewGuid();
            _accountRepoMock.Setup(r => r.GetByIdAsync(modId)).ReturnsAsync(new Account { RoleId = 3 });
            _courseRepoMock.Setup(r => r.GetAllCourseAsync()).ReturnsAsync(new List<Course> { new Course { SubCategory = new SubCategory(), Lecturer = new Lecturer { Account = new Account() } } });

            var res = await _sut.GetAllCourseAsync(modId);
            Assert.IsNotEmpty(res);
        }

        [Test]
        public void GetAllCourseAsync_Unauthorized_Throws()
        {
            var userId = Guid.NewGuid();
            _accountRepoMock.Setup(r => r.GetByIdAsync(userId)).ReturnsAsync(new Account { RoleId = 1 });
            Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.GetAllCourseAsync(userId));
        }

        [Test]
        public void GetAllCourseAsync_AccountNotFound_Throws()
        {
            _accountRepoMock.Setup(r => r.GetByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Account)null);
            Assert.ThrowsAsync<Exception>(() => _sut.GetAllCourseAsync(Guid.NewGuid()));
        }

        // ==========================================
        // 9. GetCoursesOfLecturerByAccountId
        // ==========================================
        [Test]
        public async Task GetCoursesOfLecturer_Success()
        {
            var accId = Guid.NewGuid();
            _courseRepoMock.Setup(r => r.GetCoursesOfLecturerByAccountIdAsync(accId)).ReturnsAsync(new List<Course> { new Course { SubCategory = new SubCategory() } });
            var res = await _sut.GetCoursesOfLecturerByAccountId(accId);
            Assert.IsNotEmpty(res);
        }

        [Test]
        public async Task GetCoursesOfLecturer_Empty_ReturnsEmptyList()
        {
            var accId = Guid.NewGuid();
            _courseRepoMock.Setup(r => r.GetCoursesOfLecturerByAccountIdAsync(accId)).ReturnsAsync((List<Course>)null);
            var res = await _sut.GetCoursesOfLecturerByAccountId(accId);
            Assert.IsEmpty(res);
        }

        // ==========================================
        // 10. GetCourseDetailsAsync
        // ==========================================
        [Test]
        public async Task GetCourseDetailsAsync_Success()
        {
            var cid = Guid.NewGuid();
            var course = new Course { Id = cid, Sections = new List<Section>() };
            _courseRepoMock.Setup(r => r.GetCourseWithDetailsAsync(cid)).ReturnsAsync(course);
            var res = await _sut.GetCourseDetailsAsync(cid);
            Assert.IsNotNull(res);
            Assert.AreEqual(cid, res.Id);
        }

        [Test]
        public async Task GetCourseDetailsAsync_NotFound_ReturnsNull()
        {
            _courseRepoMock.Setup(r => r.GetCourseWithDetailsAsync(It.IsAny<Guid>())).ReturnsAsync((Course)null);
            var res = await _sut.GetCourseDetailsAsync(Guid.NewGuid());
            Assert.IsNull(res);
        }

        // ==========================================
        // 11. GetCategoryPageAsync
        // ==========================================
        [Test]
        public async Task GetCategoryPageAsync_Success()
        {
            var catId = 1;
            var cat = new Category { Id = 1, Name = "C", SubCategories = new List<SubCategory>() };
            _categoryRepoMock.Setup(r => r.GetByIdWithSubCategoriesAsync(catId)).ReturnsAsync(cat);
            _courseRepoMock.Setup(r => r.GetCoursesByCategoryId(catId)).ReturnsAsync(new List<Course>());

            var res = await _sut.GetCategoryPageAsync(catId);
            Assert.IsNotNull(res);
            Assert.AreEqual("C", res.MainCategory.Name);
        }

        [Test]
        public void GetCategoryPageAsync_NotFound_Throws()
        {
            _categoryRepoMock.Setup(r => r.GetByIdWithSubCategoriesAsync(1)).ReturnsAsync((Category)null);
            Assert.ThrowsAsync<Exception>(() => _sut.GetCategoryPageAsync(1));
        }

        // ==========================================
        // 12. SetCoursePriceAsync
        // ==========================================
        [Test]
        public async Task SetCoursePriceAsync_Success()
        {
            var cid = Guid.NewGuid(); var accId = Guid.NewGuid();
            var lec = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = cid, LecturerId = lec.Id };
            var dto = new CoursePriceDto { Price = 500 };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lec);
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(cid)).ReturnsAsync(course);
            _courseRepoMock.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            var res = await _sut.SetCoursePriceAsync(cid, dto, accId);
            Assert.IsTrue(res);
            Assert.AreEqual(500, course.Price);
        }

        [Test]
        public void SetCoursePriceAsync_LecturerNotFound_Throws()
        {
            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(It.IsAny<Guid>())).ReturnsAsync((Lecturer)null);
            Assert.ThrowsAsync<Exception>(() => _sut.SetCoursePriceAsync(Guid.NewGuid(), new CoursePriceDto(), Guid.NewGuid()));
        }

        [Test]
        public void SetCoursePriceAsync_CourseNotFound_Throws()
        {
            var accId = Guid.NewGuid();
            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(new Lecturer());
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(It.IsAny<Guid>())).ReturnsAsync((Course)null);
            Assert.ThrowsAsync<Exception>(() => _sut.SetCoursePriceAsync(Guid.NewGuid(), new CoursePriceDto(), accId));
        }

        [Test]
        public void SetCoursePriceAsync_Unauthorized_Throws()
        {
            var accId = Guid.NewGuid();
            var lec = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = Guid.NewGuid(), LecturerId = Guid.NewGuid() };
            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lec);
            _courseRepoMock.Setup(r => r.GetCourseByIdAsync(course.Id)).ReturnsAsync(course);
            Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.SetCoursePriceAsync(course.Id, new CoursePriceDto(), accId));
        }

        // ==========================================
        // 13. PublishCourseForReviewAsync
        // ==========================================
        [Test]
        public async Task PublishReview_Success()
        {
            var accId = Guid.NewGuid();
            var lec = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = Guid.NewGuid(), LecturerId = lec.Id, Status = "Draft", Title = "T", Description = "D", SubCategoryId = 1, OriginalPrice = 10, Sections = new List<Section> { new Section { IsActive = true, Lessons = new List<Lesson> { new Lesson { IsActive = true } } } } };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lec);
            _courseRepoMock.Setup(r => r.GetCourseWithDetailsAsync(course.Id)).ReturnsAsync(course);
            _courseRepoMock.Setup(r => r.SaveChangesAsync()).ReturnsAsync(true);

            Assert.IsTrue(await _sut.PublishCourseForReviewAsync(course.Id, accId));
            Assert.AreEqual("Pending", course.Status);
        }

        [Test]
        public void PublishReview_AlreadyPending_Throws()
        {
            var accId = Guid.NewGuid();
            var lec = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = Guid.NewGuid(), LecturerId = lec.Id, Status = "Pending" };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lec);
            _courseRepoMock.Setup(r => r.GetCourseWithDetailsAsync(course.Id)).ReturnsAsync(course);

            var ex = Assert.ThrowsAsync<Exception>(() => _sut.PublishCourseForReviewAsync(course.Id, accId));
            Assert.AreEqual("Khóa học này đang chờ được duyệt.", ex.Message);
        }

        [Test]
        public void PublishReview_AlreadyPublic_Throws()
        {
            var accId = Guid.NewGuid();
            var lec = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = Guid.NewGuid(), LecturerId = lec.Id, Status = "Public" };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lec);
            _courseRepoMock.Setup(r => r.GetCourseWithDetailsAsync(course.Id)).ReturnsAsync(course);

            var ex = Assert.ThrowsAsync<Exception>(() => _sut.PublishCourseForReviewAsync(course.Id, accId));
            Assert.AreEqual("Khóa học này đã được xuất bản.", ex.Message);
        }

        [TestCase("", "Desc", 1)]
        [TestCase("Title", "", 1)]
        [TestCase("Title", "Desc", 0)]
        public void PublishReview_MissingBasicInfo_Throws(string title, string desc, int sub)
        {
            var accId = Guid.NewGuid();
            var lec = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = Guid.NewGuid(), LecturerId = lec.Id, Status = "Draft", Title = title, Description = desc, SubCategoryId = sub };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lec);
            _courseRepoMock.Setup(r => r.GetCourseWithDetailsAsync(course.Id)).ReturnsAsync(course);

            var ex = Assert.ThrowsAsync<Exception>(() => _sut.PublishCourseForReviewAsync(course.Id, accId));
            StringAssert.Contains("hoàn thành thông tin cơ bản", ex.Message);
        }

        [Test]
        public void PublishReview_MissingPrice_Throws()
        {
            var accId = Guid.NewGuid();
            var lec = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = Guid.NewGuid(), LecturerId = lec.Id, Status = "Draft", Title = "T", Description = "D", SubCategoryId = 1, OriginalPrice = null };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lec);
            _courseRepoMock.Setup(r => r.GetCourseWithDetailsAsync(course.Id)).ReturnsAsync(course);
            Assert.ThrowsAsync<Exception>(() => _sut.PublishCourseForReviewAsync(course.Id, accId));
        }

        [Test]
        public void PublishReview_NoActiveSection_Throws()
        {
            var accId = Guid.NewGuid();
            var lec = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = Guid.NewGuid(), LecturerId = lec.Id, Status = "Draft", Title = "T", Description = "D", SubCategoryId = 1, OriginalPrice = 10, Sections = new List<Section> { new Section { IsActive = false } } };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lec);
            _courseRepoMock.Setup(r => r.GetCourseWithDetailsAsync(course.Id)).ReturnsAsync(course);
            Assert.ThrowsAsync<Exception>(() => _sut.PublishCourseForReviewAsync(course.Id, accId));
        }

        [Test]
        public void PublishReview_NoContent_Throws()
        {
            var accId = Guid.NewGuid();
            var lec = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = Guid.NewGuid(), LecturerId = lec.Id, Status = "Draft", Title = "T", Description = "D", SubCategoryId = 1, OriginalPrice = 10, Sections = new List<Section> { new Section { IsActive = true, Lessons = new List<Lesson> { new Lesson { IsActive = false } }, Quizzes = new List<Quiz>() } } };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lec);
            _courseRepoMock.Setup(r => r.GetCourseWithDetailsAsync(course.Id)).ReturnsAsync(course);
            Assert.ThrowsAsync<Exception>(() => _sut.PublishCourseForReviewAsync(course.Id, accId));
        }

        [Test]
        public void PublishReview_Unauthorized_Throws()
        {
            var accId = Guid.NewGuid();
            var lec = new Lecturer { Id = Guid.NewGuid(), AccountId = accId };
            var course = new Course { Id = Guid.NewGuid(), LecturerId = Guid.NewGuid() };

            _lecturerRepoMock.Setup(r => r.GetLecturerByAccountIdAsync(accId)).ReturnsAsync(lec);
            _courseRepoMock.Setup(r => r.GetCourseWithDetailsAsync(course.Id)).ReturnsAsync(course);
            Assert.ThrowsAsync<UnauthorizedAccessException>(() => _sut.PublishCourseForReviewAsync(course.Id, accId));
        }
    }
}