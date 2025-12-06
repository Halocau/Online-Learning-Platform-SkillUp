using Moq;
using SkillUp.BussinessObjects.DTOs.Voucher;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Implementations;
using SkillUp.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TestSkillUp.Services
{
	[TestFixture]
	public class VoucherServiceTests
	{
		private Mock<IVoucherRepository> _mockVoucherRepo;
		private Mock<ICourseRepository> _mockCourseRepo;
		private Mock<ICurrentUserService> _mockCurrentUserService;
		private Mock<ILecturerRepository> _mockLecturerRepo;

		private VoucherService _service;

		[SetUp]
		public void Setup()
		{
			_mockVoucherRepo = new Mock<IVoucherRepository>();
			_mockCourseRepo = new Mock<ICourseRepository>();
			_mockCurrentUserService = new Mock<ICurrentUserService>();
			_mockLecturerRepo = new Mock<ILecturerRepository>();

			_service = new VoucherService(
				_mockVoucherRepo.Object,
				_mockCourseRepo.Object,
				_mockCurrentUserService.Object,
				_mockLecturerRepo.Object
			);
		}

		#region AddVoucher

		[Test]
		public void AddVoucher_ShouldThrowUnauthorized_WhenUserNotLoggedIn()
		{
			_mockCurrentUserService.Setup(x => x.UserId).Returns((Guid?)null);
			var dto = new AddVoucherDTO();

			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await _service.AddVoucher(dto));
			Assert.That(ex.Message, Is.EqualTo("Bạn không phải giảng viên"));
		}

		[Test]
		public void AddVoucher_ShouldThrowUnauthorized_WhenUserNotLecturer()
		{
			var userId = Guid.NewGuid();
			_mockCurrentUserService.Setup(x => x.UserId).Returns(userId);
			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(userId)).ReturnsAsync((Lecturer)null);

			var dto = new AddVoucherDTO();

			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await _service.AddVoucher(dto));
			Assert.That(ex.Message, Is.EqualTo("Bạn không phải giảng viên"));
		}

		[Test]
		public async Task AddVoucher_ShouldThrowException_WhenCourseIdNull()
		{
			var ctx = SetupAuthorizedContext();
			var dto = new AddVoucherDTO { CourseId = null };

			var ex = Assert.ThrowsAsync<Exception>(async () => await _service.AddVoucher(dto));
			Assert.That(ex.Message, Is.EqualTo("CourseId không được để trống!"));
		}

		[Test]
		public async Task AddVoucher_ShouldThrowException_WhenCourseNotFound()
		{
			var ctx = SetupAuthorizedContext();
			var wrongCourseId = Guid.NewGuid();
			_mockCourseRepo.Setup(x => x.GetByIdAsync(wrongCourseId)).ReturnsAsync((Course)null);

			var dto = new AddVoucherDTO { CourseId = wrongCourseId };

			var ex = Assert.ThrowsAsync<Exception>(async () => await _service.AddVoucher(dto));
			Assert.That(ex.Message, Is.EqualTo("Không tìm thấy khoá học"));
		}

		[Test]
		public async Task AddVoucher_ShouldThrowUnauthorized_WhenLecturerDoesNotOwnCourse()
		{
			var ctx = SetupAuthorizedContext();
			var otherCourseId = Guid.NewGuid();

			// Course belongs to someone else
			_mockCourseRepo.Setup(x => x.GetByIdAsync(otherCourseId))
				.ReturnsAsync(new Course { Id = otherCourseId, LecturerId = Guid.NewGuid() });

			var dto = new AddVoucherDTO { CourseId = otherCourseId };

			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await _service.AddVoucher(dto));
			Assert.That(ex.Message, Is.EqualTo("Bạn không phải giảng viên của khoá học này"));
		}

		[Test]
		public async Task AddVoucher_ShouldThrowException_WhenVoucherTypeInvalid()
		{
			var ctx = SetupAuthorizedContext();
			var dto = new AddVoucherDTO { CourseId = ctx.courseId, VoucherType = 999 }; // 999 not in setup

			var ex = Assert.ThrowsAsync<Exception>(async () => await _service.AddVoucher(dto));
			Assert.That(ex.Message, Is.EqualTo("Loại mã giảm giá không hợp lệ"));
		}

		[Test]
		public async Task AddVoucher_ShouldSuccess_WhenValid()
		{
			// Arrange
			var ctx = SetupAuthorizedContext();
			var now = DateTime.Now;
			var start = DateTime.SpecifyKind(now.AddDays(1), DateTimeKind.Unspecified);
			var end = DateTime.SpecifyKind(now.AddDays(5), DateTimeKind.Unspecified);

			var dto = new AddVoucherDTO
			{
				CourseId = ctx.courseId,
				VoucherType = 1, // Valid type from SetupAuthorizedContext
				CouponCode = "TESTCODE",
				Price = 100000,
				StartTime = start,
				EndTime = end
			};

			// Act
			var result = await _service.AddVoucher(dto);

			// Assert
			_mockVoucherRepo.Verify(x => x.AddVoucher(It.Is<Voucher>(v =>
				v.CouponCode == "TESTCODE" &&
				v.StartTime.Value.Kind == DateTimeKind.Local &&
				v.IsActive == true
			)), Times.Once);

			_mockVoucherRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
			Assert.IsNotNull(result);
		}

		#endregion

		#region DeleteVoucher

		[Test]
		public void DeleteVoucher_ShouldThrowUnauthorized_WhenUserNotLoggedIn()
		{
			_mockCurrentUserService.Setup(x => x.UserId).Returns((Guid?)null);
			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await _service.DeleteVoucher(Guid.NewGuid()));
			Assert.That(ex.Message, Is.EqualTo("Bạn không phải giảng viên"));
		}

		[Test]
		public async Task DeleteVoucher_ShouldThrowException_WhenVoucherNotFound()
		{
			var ctx = SetupAuthorizedContext();
			var id = Guid.NewGuid();
			_mockVoucherRepo.Setup(x => x.GetVoucherById(id)).ReturnsAsync((Voucher)null);

			var ex = Assert.ThrowsAsync<Exception>(async () => await _service.DeleteVoucher(id));
			Assert.That(ex.Message, Is.EqualTo("Không tìm thấy voucher"));
		}

		[Test]
		public async Task DeleteVoucher_ShouldThrowUnauthorized_WhenLecturerDoesNotOwnCourse()
		{
			var ctx = SetupAuthorizedContext(); // Provides valid lecturer context
			var voucherId = Guid.NewGuid();
			var otherCourseId = Guid.NewGuid();

			var voucher = new Voucher { Id = voucherId, CourseId = otherCourseId };
			_mockVoucherRepo.Setup(x => x.GetVoucherById(voucherId)).ReturnsAsync(voucher);

			// Course exists but belongs to different lecturer
			_mockCourseRepo.Setup(x => x.GetByIdAsync(otherCourseId))
				.ReturnsAsync(new Course { Id = otherCourseId, LecturerId = Guid.NewGuid() });

			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await _service.DeleteVoucher(voucherId));
			Assert.That(ex.Message, Is.EqualTo("Bạn không phải giảng viên của khoá học này"));
		}

		[Test]
		public async Task DeleteVoucher_ShouldSoftDelete_WhenAuthorized()
		{
			// Arrange
			var ctx = SetupAuthorizedContext();
			var voucherId = Guid.NewGuid();
			var voucher = new Voucher { Id = voucherId, CourseId = ctx.courseId, IsActive = true };

			_mockVoucherRepo.Setup(x => x.GetVoucherById(voucherId)).ReturnsAsync(voucher);
			// ctx.courseId is already mocked in SetupAuthorizedContext to belong to ctx.lecturerId

			// Act
			await _service.DeleteVoucher(voucherId);

			// Assert
			Assert.IsFalse(voucher.IsActive);
			_mockVoucherRepo.Verify(x => x.UpdateVoucher(voucher), Times.Once);
			_mockVoucherRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
		}

		#endregion

		#region UpdateVoucher

		[Test]
		public void UpdateVoucher_ShouldThrowUnauthorized_WhenUserNotLoggedIn()
		{
			_mockCurrentUserService.Setup(x => x.UserId).Returns((Guid?)null);
			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
				await _service.UpdateVoucher(new AddVoucherDTO(), Guid.NewGuid()));
			Assert.That(ex.Message, Is.EqualTo("Bạn không phải giảng viên"));
		}

		[Test]
		public void UpdateVoucher_ShouldThrowUnauthorized_WhenUserNotLecturer()
		{
			var userId = Guid.NewGuid();
			_mockCurrentUserService.Setup(x => x.UserId).Returns(userId);
			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(userId)).ReturnsAsync((Lecturer)null);

			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
				await _service.UpdateVoucher(new AddVoucherDTO(), Guid.NewGuid()));
			Assert.That(ex.Message, Is.EqualTo("Bạn không phải giảng viên"));
		}

		[Test]
		public async Task UpdateVoucher_ShouldThrowException_WhenCourseIdNull()
		{
			var ctx = SetupAuthorizedContext();
			var dto = new AddVoucherDTO { CourseId = null };

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.UpdateVoucher(dto, Guid.NewGuid()));
			Assert.That(ex.Message, Is.EqualTo("CourseId không được để trống!"));
		}

		[Test]
		public async Task UpdateVoucher_ShouldThrowException_WhenCourseNotFound()
		{
			var ctx = SetupAuthorizedContext();
			var missingCourseId = Guid.NewGuid();
			_mockCourseRepo.Setup(x => x.GetByIdAsync(missingCourseId)).ReturnsAsync((Course)null);

			var dto = new AddVoucherDTO { CourseId = missingCourseId };

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.UpdateVoucher(dto, Guid.NewGuid()));
			Assert.That(ex.Message, Is.EqualTo("Không tìm thấy khoá học"));
		}

		[Test]
		public async Task UpdateVoucher_ShouldThrowUnauthorized_WhenLecturerDoesNotOwnCourse()
		{
			var ctx = SetupAuthorizedContext();
			var otherCourseId = Guid.NewGuid();

			// Course belongs to someone else
			_mockCourseRepo.Setup(x => x.GetByIdAsync(otherCourseId))
				.ReturnsAsync(new Course { Id = otherCourseId, LecturerId = Guid.NewGuid() });

			var dto = new AddVoucherDTO { CourseId = otherCourseId };

			var ex = Assert.ThrowsAsync<UnauthorizedAccessException>(async () =>
				await _service.UpdateVoucher(dto, Guid.NewGuid()));
			Assert.That(ex.Message, Is.EqualTo("Bạn không phải giảng viên của khoá học này"));
		}

		[Test]
		public async Task UpdateVoucher_ShouldThrowException_WhenVoucherTypeInvalid()
		{
			var ctx = SetupAuthorizedContext();
			var dto = new AddVoucherDTO { CourseId = ctx.courseId, VoucherType = 999 };

			var ex = Assert.ThrowsAsync<Exception>(async () =>
				await _service.UpdateVoucher(dto, Guid.NewGuid()));
			Assert.That(ex.Message, Is.EqualTo("Loại mã giảm giá không hợp lệ"));
		}

		[Test]
		public async Task UpdateVoucher_ShouldReturnNull_WhenVoucherNotFound()
		{
			var ctx = SetupAuthorizedContext();
			var voucherId = Guid.NewGuid();
			var dto = new AddVoucherDTO { CourseId = ctx.courseId, VoucherType = 1 };

			_mockVoucherRepo.Setup(x => x.GetVoucherById(voucherId)).ReturnsAsync((Voucher)null);

			var result = await _service.UpdateVoucher(dto, voucherId);
			Assert.IsNull(result);
		}

		[Test]
		public async Task UpdateVoucher_ShouldUpdateAndSave_WhenAuthorized()
		{
			// Arrange
			var ctx = SetupAuthorizedContext();
			var voucherId = Guid.NewGuid();

			var existing = new Voucher { Id = voucherId, CouponCode = "OLD", VoucherType = 1, CourseId = ctx.courseId };
			_mockVoucherRepo.Setup(x => x.GetVoucherById(voucherId)).ReturnsAsync(existing);

			var dto = new AddVoucherDTO
			{
				CourseId = ctx.courseId, // Must be owned by lecturer
				VoucherType = 1,
				CouponCode = "NEW",
				StartTime = DateTime.Now,
				EndTime = DateTime.Now.AddDays(1)
			};

			// Act
			var result = await _service.UpdateVoucher(dto, voucherId);

			// Assert
			Assert.IsNotNull(result);
			Assert.AreEqual("NEW", existing.CouponCode);
			_mockVoucherRepo.Verify(x => x.UpdateVoucher(existing), Times.Once);
			_mockVoucherRepo.Verify(x => x.SaveChangesAsync(), Times.Once);
		}

		#endregion

		#region GetVouchers (Existing Tests - largely unchanged but kept for completeness)

		[Test]
		public async Task GetVoucherByCourseId_ShouldReturnMappedDTOs()
		{
			var courseId = Guid.NewGuid();
			var vouchers = new List<Voucher>
			{
				new Voucher { Id = Guid.NewGuid(), VoucherType = 1, VoucherTypeNavigation = new VoucherType { Percentage = 10 } }
			};
			_mockVoucherRepo.Setup(x => x.GetVoucherByCourseId(courseId)).ReturnsAsync(vouchers);

			var result = await _service.GetVoucherByCourseId(courseId);
			Assert.AreEqual(1, result.Count);
			Assert.AreEqual(10, result[0].Percentage);
		}

		[Test]
		public async Task GetVouchersByCourseIds_ShouldEnsureAllKeysExist()
		{
			var courseIdWithVoucher = Guid.NewGuid();
			var courseIdWithoutVoucher = Guid.NewGuid();
			var inputIds = new List<Guid> { courseIdWithVoucher, courseIdWithoutVoucher };

			var dictFromRepo = new Dictionary<Guid, List<Voucher>>
			{
				{ courseIdWithVoucher, new List<Voucher> { new Voucher { Id = Guid.NewGuid(), VoucherType = 1 } } }
			};

			_mockVoucherRepo.Setup(x => x.GetVouchersByCourseIds(inputIds)).ReturnsAsync(dictFromRepo);

			var result = await _service.GetVouchersByCourseIds(inputIds);
			Assert.IsTrue(result.ContainsKey(courseIdWithVoucher));
			Assert.IsTrue(result.ContainsKey(courseIdWithoutVoucher));
			Assert.AreEqual(0, result[courseIdWithoutVoucher].Count);
		}

		[Test]
		public async Task GetVoucherById_ShouldReturnNull_WhenNotFound()
		{
			_mockVoucherRepo.Setup(x => x.GetVoucherById(It.IsAny<Guid>())).ReturnsAsync((Voucher)null);
			var result = await _service.GetVoucherById(Guid.NewGuid());
			Assert.IsNull(result);
		}

		[Test]
		public async Task GetVoucherById_ShouldReturnMappedDTO_WhenFound()
		{
			var id = Guid.NewGuid();
			var voucher = new Voucher { Id = id, CouponCode = "FOUND123", VoucherType = 1, VoucherTypeNavigation = new VoucherType { Percentage = 15 } };
			_mockVoucherRepo.Setup(x => x.GetVoucherById(id)).ReturnsAsync(voucher);

			var result = await _service.GetVoucherById(id);
			Assert.IsNotNull(result);
			Assert.AreEqual("FOUND123", result.CouponCode);
		}

		#endregion

		#region Helpers

		private (Guid userId, Guid lecturerId, Guid courseId) SetupAuthorizedContext()
		{
			var userId = Guid.NewGuid();
			var lecturerId = Guid.NewGuid();
			var courseId = Guid.NewGuid();

			_mockCurrentUserService.Setup(x => x.UserId).Returns(userId);

			_mockLecturerRepo.Setup(x => x.GetLecturerByAccountIdAsync(userId))
				.ReturnsAsync(new Lecturer { Id = lecturerId, AccountId = userId });

			_mockCourseRepo.Setup(x => x.GetByIdAsync(courseId))
				.ReturnsAsync(new Course { Id = courseId, LecturerId = lecturerId });

			// Mock valid voucher types
			_mockVoucherRepo.Setup(x => x.GetAllVoucherTypes())
				.ReturnsAsync(new List<VoucherType> { new VoucherType { Id = 1 }, new VoucherType { Id = 2 } });

			return (userId, lecturerId, courseId);
		}

		#endregion
	}
}
