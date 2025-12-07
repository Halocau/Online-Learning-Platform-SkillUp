using Moq;
using NUnit.Framework;
using SkillUp.BussinessObjects.DTOs.Cart;
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
    public class CartServiceTests
    {
        private Mock<ICartRepository> _mockCartRepository;
        private Mock<IStudentRepository> _mockStudentRepository;
        private Mock<ICourseRepository> _mockCourseRepository;
        private CartService _cartService;

        [SetUp]
        public void Setup()
        {
            _mockCartRepository = new Mock<ICartRepository>();
            _mockStudentRepository = new Mock<IStudentRepository>();
            _mockCourseRepository = new Mock<ICourseRepository>();

            _cartService = new CartService(
                _mockCartRepository.Object,
                _mockStudentRepository.Object,
                _mockCourseRepository.Object
            );
        }

        #region GetStudentByAccountIdAsync (Indirect Test via Public Methods)

        [Test]
        public void AddToCartByAccountIdAsync_StudentNotFound_ThrowsInvalidOperationException()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            _mockStudentRepository.Setup(repo => repo.GetByAccountIdAsync(accountId))
                .ReturnsAsync((Student)null);

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _cartService.AddToCartByAccountIdAsync(accountId, new AddToCartRequestDto()));

            Assert.AreEqual("Student not found.", ex.Message);
        }

        #endregion

        #region AddToCartByAccountIdAsync

        [Test]
        public async Task AddToCartByAccountIdAsync_StudentEnrolled_ThrowsInvalidOperationException()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var courseId = Guid.NewGuid();
            var student = new Student { Id = Guid.NewGuid(), AccountId = accountId };

            _mockStudentRepository.Setup(repo => repo.GetByAccountIdAsync(accountId)).ReturnsAsync(student);
            _mockCartRepository.Setup(repo => repo.IsStudentEnrolledInCourseAsync(student.Id, courseId))
                .ReturnsAsync(true); // Đã đăng ký

            var request = new AddToCartRequestDto { CourseId = courseId };

            // Act & Assert
            var ex = Assert.ThrowsAsync<InvalidOperationException>(async () =>
                await _cartService.AddToCartByAccountIdAsync(accountId, request));

            Assert.That(ex.Message, Does.Contain("đã đăng ký khóa học này"));
        }

        [Test]
        public async Task AddToCartByAccountIdAsync_ItemAlreadyInCart_ReturnsTrueWithoutAdding()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var courseId = Guid.NewGuid();
            var student = new Student { Id = Guid.NewGuid() };
            var cart = new Cart
            {
                Id = Guid.NewGuid(),
                CartItems = new List<CartItem> { new CartItem { CourseId = courseId } }
            };

            _mockStudentRepository.Setup(repo => repo.GetByAccountIdAsync(accountId)).ReturnsAsync(student);
            _mockCartRepository.Setup(repo => repo.IsStudentEnrolledInCourseAsync(student.Id, courseId)).ReturnsAsync(false);
            _mockCartRepository.Setup(repo => repo.GetCartByStudentIdAsync(student.Id)).ReturnsAsync(cart);

            var request = new AddToCartRequestDto { CourseId = courseId };

            // Act
            var result = await _cartService.AddToCartByAccountIdAsync(accountId, request);

            // Assert
            Assert.IsTrue(result);
            _mockCartRepository.Verify(repo => repo.AddToCartAsync(It.IsAny<CartItem>()), Times.Never); // Không gọi Add
            _mockCartRepository.Verify(repo => repo.SaveChangesAsync(), Times.Never); // Không gọi Save
        }

        [Test]
        public async Task AddToCartByAccountIdAsync_NewItem_CreatesCartAndAddsItem_ReturnsTrue()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var courseId = Guid.NewGuid();
            var student = new Student { Id = Guid.NewGuid() };

            // Giả lập chưa có Cart
            _mockStudentRepository.Setup(repo => repo.GetByAccountIdAsync(accountId)).ReturnsAsync(student);
            _mockCartRepository.Setup(repo => repo.IsStudentEnrolledInCourseAsync(student.Id, courseId)).ReturnsAsync(false);
            _mockCartRepository.Setup(repo => repo.GetCartByStudentIdAsync(student.Id)).ReturnsAsync((Cart)null);
            _mockCartRepository.Setup(repo => repo.SaveChangesAsync()).ReturnsAsync(true);

            var request = new AddToCartRequestDto { CourseId = courseId, Price = 100 };

            // Act
            var result = await _cartService.AddToCartByAccountIdAsync(accountId, request);

            // Assert
            Assert.IsTrue(result);
            // Verify tạo Cart mới
            _mockCartRepository.Verify(repo => repo.AddCart(It.Is<Cart>(c => c.StudentId == student.Id)), Times.Once);
            // Verify thêm Item
            _mockCartRepository.Verify(repo => repo.AddToCartAsync(It.Is<CartItem>(ci => ci.CourseId == courseId && ci.Price == 100)), Times.Once);
            // Verify Save
            _mockCartRepository.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }

        #endregion

        #region GetCartByAccountIdAsync

        [Test]
        public async Task GetCartByAccountIdAsync_CartExists_ReturnsMappedDto()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var student = new Student { Id = Guid.NewGuid() };
            var cartId = Guid.NewGuid();
            var courseId = Guid.NewGuid();

            var cart = new Cart
            {
                Id = cartId,
                StudentId = student.Id,
                CartItems = new List<CartItem>    
                {
                    new CartItem
                    {
                        Id = Guid.NewGuid(),
                        CourseId = courseId,
                        Price = 50,
                        Course = new Course
                        {
                            Title = "Test Course",
                            Lecturer = new Lecturer { Account = new Account { Fullname = "Mr A" } }
                        }
                    }
                }
            };

            _mockStudentRepository.Setup(repo => repo.GetByAccountIdAsync(accountId)).ReturnsAsync(student);
            _mockCartRepository.Setup(repo => repo.GetCartByStudentIdAsync(student.Id)).ReturnsAsync(cart);

            // Act
            var result = await _cartService.GetCartByAccountIdAsync(accountId);

            // Assert
            Assert.IsNotNull(result);
            Assert.AreEqual(cartId, result.Id);
            Assert.AreEqual(1, result.CartItems.Count);
            Assert.AreEqual("Test Course", result.CartItems[0].Course.Title);
            Assert.AreEqual("Mr A", result.CartItems[0].Course.LecturerName);
        }

        [Test]
        public async Task GetCartByAccountIdAsync_CartIsNull_ReturnsNull()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var student = new Student { Id = Guid.NewGuid() };

            _mockStudentRepository.Setup(repo => repo.GetByAccountIdAsync(accountId)).ReturnsAsync(student);
            _mockCartRepository.Setup(repo => repo.GetCartByStudentIdAsync(student.Id)).ReturnsAsync((Cart)null);

            // Act
            var result = await _cartService.GetCartByAccountIdAsync(accountId);

            // Assert
            Assert.IsNull(result);
        }

        #endregion

        #region RemoveFromCartAsync

        [Test]
        public async Task RemoveFromCartAsync_CallsRepoAndSaves()
        {
            // Arrange
            var cartItemId = Guid.NewGuid();
            _mockCartRepository.Setup(repo => repo.SaveChangesAsync()).ReturnsAsync(true);

            // Act
            var result = await _cartService.RemoveFromCartAsync(cartItemId);

            // Assert
            Assert.IsTrue(result);
            _mockCartRepository.Verify(repo => repo.RemoveFromCartAsync(cartItemId), Times.Once);
            _mockCartRepository.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }

        #endregion

        #region BulkAddToCartByAccountIdAsync

        [Test]
        public async Task BulkAddToCartByAccountIdAsync_ValidItems_AddsDistinctAndNotEnrolled()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var student = new Student { Id = Guid.NewGuid() };
            var cart = new Cart { Id = Guid.NewGuid() };

            var courseIdNew = Guid.NewGuid();
            var courseIdEnrolled = Guid.NewGuid();
            var courseIdInCart = Guid.NewGuid();
            var courseIdInvalid = Guid.Empty;

            var items = new List<AddToCartRequestDto>
            {
                new AddToCartRequestDto { CourseId = courseIdNew, Price = 10 },
                new AddToCartRequestDto { CourseId = courseIdEnrolled, Price = 10 },
                new AddToCartRequestDto { CourseId = courseIdInCart, Price = 10 },
                new AddToCartRequestDto { CourseId = courseIdInvalid, Price = 0 },
                new AddToCartRequestDto { CourseId = courseIdNew, Price = 10 }
            };

            // Setup Student & Cart
            _mockStudentRepository.Setup(repo => repo.GetByAccountIdAsync(accountId)).ReturnsAsync(student);
            _mockCartRepository.Setup(repo => repo.GetCartByStudentIdAsync(student.Id)).ReturnsAsync(cart);

            // --- SỬA LỖI Ở ĐÂY: Đổi List thành HashSet ---
            _mockCartRepository.Setup(repo => repo.GetCourseIdsInCartAsync(cart.Id))
                .ReturnsAsync(new HashSet<Guid> { courseIdInCart });
            // ---------------------------------------------

            // Setup Enrollment check
            _mockCartRepository.Setup(repo => repo.IsStudentEnrolledInCourseAsync(student.Id, courseIdNew)).ReturnsAsync(false);
            _mockCartRepository.Setup(repo => repo.IsStudentEnrolledInCourseAsync(student.Id, courseIdEnrolled)).ReturnsAsync(true);

            // Setup Course Exist check
            _mockCourseRepository.Setup(repo => repo.ExistsAsync(courseIdNew)).ReturnsAsync(true);

            // Setup Save
            _mockCartRepository.Setup(repo => repo.SaveChangesAsync()).ReturnsAsync(true);

            // Act
            var result = await _cartService.BulkAddToCartByAccountIdAsync(accountId, items);

            // Assert
            Assert.AreEqual(1, result.Added, "Should add only 1 valid new course");
            Assert.AreEqual(2, result.Skipped, "Should skip enrolled and existing-in-cart courses");

            Assert.Contains(courseIdInCart, result.SkippedCourseIds);
            Assert.Contains(courseIdEnrolled, result.SkippedCourseIds);

            _mockCartRepository.Verify(repo => repo.AddCartItemsRangeAsync(It.Is<List<CartItem>>(l => l.Count == 1 && l[0].CourseId == courseIdNew)), Times.Once);
        }

        [Test]
        public async Task BulkAddToCartByAccountIdAsync_CartDoesNotExist_CreatesNewCart()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var student = new Student { Id = Guid.NewGuid() };
            var courseId = Guid.NewGuid();
            var items = new List<AddToCartRequestDto> { new AddToCartRequestDto { CourseId = courseId, Price = 10 } };

            _mockStudentRepository.Setup(repo => repo.GetByAccountIdAsync(accountId)).ReturnsAsync(student);
            _mockCartRepository.Setup(repo => repo.GetCartByStudentIdAsync(student.Id)).ReturnsAsync((Cart)null);

            // --- SỬA LỖI Ở ĐÂY: Đổi List thành HashSet ---
            _mockCartRepository.Setup(repo => repo.GetCourseIdsInCartAsync(It.IsAny<Guid>()))
                .ReturnsAsync(new HashSet<Guid>());
            // ---------------------------------------------

            _mockCourseRepository.Setup(repo => repo.ExistsAsync(courseId)).ReturnsAsync(true);
            _mockCartRepository.Setup(repo => repo.SaveChangesAsync()).ReturnsAsync(true);

            // Act
            await _cartService.BulkAddToCartByAccountIdAsync(accountId, items);

            // Assert
            _mockCartRepository.Verify(repo => repo.AddCart(It.IsAny<Cart>()), Times.Once);
            _mockCartRepository.Verify(repo => repo.SaveChangesAsync(), Times.Exactly(2));
        }

        #endregion

        #region ClearCartAsync

        [Test]
        public async Task ClearCartAsync_CallsRepoAndSaves()
        {
            // Arrange
            var accountId = Guid.NewGuid();
            var student = new Student { Id = Guid.NewGuid() };

            _mockStudentRepository.Setup(repo => repo.GetByAccountIdAsync(accountId)).ReturnsAsync(student);
            _mockCartRepository.Setup(repo => repo.SaveChangesAsync()).ReturnsAsync(true);

            // Act
            var result = await _cartService.ClearCartAsync(accountId);

            // Assert
            Assert.IsTrue(result);
            _mockCartRepository.Verify(repo => repo.ClearCartAsync(student.Id), Times.Once);
            _mockCartRepository.Verify(repo => repo.SaveChangesAsync(), Times.Once);
        }

        #endregion
    }
}