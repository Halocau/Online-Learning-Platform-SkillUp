using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using Moq.Protected;
using NUnit.Framework;
using SkillUp.BussinessObjects.DTOs.PayOS; // Adjust namespace
using SkillUp.BussinessObjects.Models;
using SkillUp.Services.Common;
using SkillUp.Services.Implementations;
using SkillUp.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Security.Cryptography;

namespace TestSkillUp.Services
{

	[TestFixture]
	public class PayOSServiceTests
	{
		private SkillUpContext _context;
		private Mock<IConfiguration> _mockConfig;
		private Mock<HttpMessageHandler> _mockHttpMessageHandler;
		private HttpClient _httpClient;
		private Mock<IEmailService> _mockEmailService;
		private PayOSService _service;

		[SetUp]
		public void Setup()
		{
			// 1. Setup In-Memory Database
			var options = new DbContextOptionsBuilder<SkillUpContext>()
				.UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
				.Options;
			_context = new SkillUpContext(options);

			// 2. Setup Configuration Mock
			_mockConfig = new Mock<IConfiguration>();
			_mockConfig.Setup(c => c["PayOS:ClientId"]).Returns("test-client-id");
			_mockConfig.Setup(c => c["PayOS:ApiKey"]).Returns("test-api-key");
			_mockConfig.Setup(c => c["PayOS:ChecksumKey"]).Returns("test-checksum-key");
			_mockConfig.Setup(c => c["FrontendUrl"]).Returns("http://localhost:5173");

			// 3. Setup HttpClient Mock
			_mockHttpMessageHandler = new Mock<HttpMessageHandler>();
			_httpClient = new HttpClient(_mockHttpMessageHandler.Object);

			// 4. Setup EmailService Mock
			_mockEmailService = new Mock<IEmailService>();

			// 5. Initialize Service (Injecting HttpClient and EmailService)
			_service = new PayOSService(_context, _mockConfig.Object, _mockEmailService.Object, _httpClient);
		}

		[TearDown]
		public void TearDown()
		{
			_context.Database.EnsureDeleted();
			_context.Dispose();
			_httpClient.Dispose();
		}

		#region CreateCartPayment Tests

		[Test]
		public async Task CreateCartPayment_ShouldReturnError_WhenCartIsEmpty()
		{
			// Arrange
			var accountId = Guid.NewGuid();
			// Test with empty list
			var request = new CartPaymentRequestDto { Items = new List<CartPaymentItemDto>() };

			// Act
			var result = await _service.CreateCartPaymentAsync(accountId, request);

			// Assert
			Assert.That(result.Success, Is.False);
			Assert.That(result.Message, Is.EqualTo("Giỏ hàng trống"));
		}

		[Test]
		public async Task CreateCartPayment_ShouldReturnError_WhenStudentNotFound()
		{
			// Arrange
			var accountId = Guid.NewGuid();
			var request = new CartPaymentRequestDto
			{
				Items = new List<CartPaymentItemDto>
				{
					new CartPaymentItemDto { CourseId = Guid.NewGuid(), FinalPrice = 100 }
				}
			};

			// Act
			var result = await _service.CreateCartPaymentAsync(accountId, request);

			// Assert
			Assert.That(result.Success, Is.False);
			Assert.That(result.Message, Is.EqualTo("Không tìm thấy thông tin học viên"));
		}

		[Test]
		public async Task CreateCartPayment_ShouldReturnError_WhenCourseDoesNotExist()
		{
			// Arrange
			var accountId = Guid.NewGuid();
			_context.Students.Add(new Student { Id = Guid.NewGuid(), AccountId = accountId });
			await _context.SaveChangesAsync();

			var request = new CartPaymentRequestDto
			{
				Items = new List<CartPaymentItemDto>
				{
					new CartPaymentItemDto { CourseId = Guid.NewGuid(), FinalPrice = 100 }
				},
				TotalAmount = 100
			};

			// Act
			var result = await _service.CreateCartPaymentAsync(accountId, request);

			// Assert
			Assert.That(result.Success, Is.False);
			Assert.That(result.Message, Does.Contain("không tồn tại"));
		}

		[Test]
		public async Task CreateCartPayment_ShouldReturnError_WhenAlreadyEnrolled()
		{
			// Arrange
			var ctx = await SetupValidContextAsync();

			// Enroll student manually
			_context.Enrollments.Add(new Enrollment
			{
				StudentId = ctx.studentId,
				CourseId = ctx.courseId
			});
			await _context.SaveChangesAsync();

			var request = new CartPaymentRequestDto
			{
				Items = new List<CartPaymentItemDto>
				{
					new CartPaymentItemDto { CourseId = ctx.courseId, FinalPrice = 500000 }
				},
				TotalAmount = 500000
			};

			// Act
			var result = await _service.CreateCartPaymentAsync(ctx.accountId, request);

			// Assert
			Assert.That(result.Success, Is.False);
			Assert.That(result.Message, Is.EqualTo("Bạn đã đăng ký một số khóa học trong giỏ hàng"));
		}

		[Test]
		public async Task CreateCartPayment_ShouldCallPayOS_AndReturnUrl_WhenValid()
		{
			// Arrange
			var ctx = await SetupValidContextAsync();

			// Note: We use CartPaymentItemDto here because the Service requires FinalPrice
			var request = new CartPaymentRequestDto
			{
				Items = new List<CartPaymentItemDto>
				{
					new CartPaymentItemDto { CourseId = ctx.courseId, FinalPrice = 500000 }
				},
				TotalAmount = 500000
			};

			// Mock PayOS API Response
			var payOsResponse = new
			{
				code = "00",
				desc = "Success",
				data = new { checkoutUrl = "https://payos.vn/cart-checkout" }
			};
			SetupMockHttpResponse(payOsResponse);

			// Act
			var result = await _service.CreateCartPaymentAsync(ctx.accountId, request);

			// Assert
			Assert.That(result.Success, Is.True);
			Assert.That(result.CheckoutUrl, Is.EqualTo("https://payos.vn/cart-checkout"));

			// Verify Transaction stored in DB
			var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.AccountId == ctx.accountId);
			Assert.IsNotNull(transaction);
			Assert.That(transaction.Amount, Is.EqualTo(500000));
			// Verify Description contains Voucher info (logic from your Service)
			Assert.That(transaction.Description, Does.Contain("OrderCode:"));
		}

		#endregion

		#region VerifyCartPayment Tests

		[Test]
		public async Task VerifyCartPayment_ShouldReturnTrue_AndEnrollStudent_WhenSuccess()
		{
			// Arrange
			var ctx = await SetupValidContextAsync();
			var orderCode = "999999";
			var paymentMethod = "PayOS";

			// 1. Create a Pending Transaction
			var transaction = new Transaction
			{
				Id = Guid.NewGuid(),
				AccountId = ctx.accountId,
				Status = "Pending",
				Amount = 500000,
				// The description string is mostly for humans/logging in this service implementation
				Description = $"OrderCode:{orderCode}",
				PaymentMethod = paymentMethod,
			};
			_context.Transactions.Add(transaction);

			// The service needs this to know WHICH courses are in this cart payment
			_context.TransactionDetails.Add(new TransactionDetail
			{
				Id = Guid.NewGuid(),
				TransactionId = transaction.Id,
				CourseId = ctx.courseId,
				Price = 500000, // This is the final price paid
				Percentage = 0,
				LecturerIncome = 0
			});

			// 2. Create a Cart (Your existing logic is fine here)
			var cart = new Cart { StudentId = ctx.studentId };
			_context.Carts.Add(cart);
			_context.CartItems.Add(new CartItem
			{
				CartId = cart.Id,
				CourseId = ctx.courseId,
				Price = 500000
			});
			await _context.SaveChangesAsync();

			// 3. Mock PayOS Verification API
			var verifyResponse = new
			{
				code = "00",
				desc = "Success",
				data = new { status = "PAID", amount = 500000 }
			};
			SetupMockHttpResponse(verifyResponse);

			// Act
			var result = await _service.VerifyCartPaymentAndEnrollAsync(orderCode);

			// Assert
			Assert.That(result, Is.True);

			// Verify Enrollment
			var enrollment = await _context.Enrollments.FirstOrDefaultAsync(e => e.StudentId == ctx.studentId && e.CourseId == ctx.courseId);
			Assert.IsNotNull(enrollment, "Student should be enrolled");

			// Verify Cart Cleared
			var remainingCartItems = await _context.CartItems.Where(ci => ci.CourseId == ctx.courseId).ToListAsync();
			Assert.That(remainingCartItems.Count, Is.EqualTo(0));
		}

		#endregion

		#region ProcessPaymentWebhookAsync Tests

		[Test]
		public async Task ProcessWebhook_ShouldReturnFalse_WhenSignatureIsInvalid()
		{
			// Arrange
			var payload = JsonSerializer.Deserialize<JsonElement>(
				"{\"data\":{\"orderCode\":\"123\",\"amount\":100},\"signature\":\"wrong-signature\"}"
			);

			// Act
			var result = await _service.ProcessPaymentWebhookAsync(payload);

			// Assert
			Assert.That(result, Is.False);
		}

		[Test]
		public async Task ProcessWebhook_ShouldReturnTrue_WhenSignatureIsValid_AndPaymentVerified()
		{
			// Arrange
			var paymentMethod = "PayOS";
			var orderCode = "123456";
			var amount = 100000;
			var checksumKey = "test-checksum-key"; // Ensure this matches Service config!

			// 1. Setup Data & Signature
			var dataObj = new { orderCode = orderCode, amount = amount };
			var dataJson = JsonSerializer.Serialize(dataObj);

			string signature;
			using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(checksumKey)))
			{
				var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(dataJson));
				signature = BitConverter.ToString(hash).Replace("-", "").ToLower();
			}

			var jsonString = $"{{\"data\":{dataJson},\"signature\":\"{signature}\"}}";
			var payload = JsonSerializer.Deserialize<JsonElement>(jsonString);

			// 2. Setup Database State
			var courseId = Guid.NewGuid();
			var transaction = new Transaction
			{
				Id = Guid.NewGuid(),
				AccountId = Guid.NewGuid(),
				Status = "Pending",
				Description = $"OrderCode:{orderCode}|CourseId:{courseId}",
				Amount = amount,
				PaymentMethod = paymentMethod,
			};

			_context.Transactions.Add(transaction);
			_context.Students.Add(new Student { AccountId = transaction.AccountId });

			_context.Courses.Add(new Course
			{
				Id = courseId,
				Price = amount,
				IsActive = true,
				Title = "Test Course Title",
				Description = "Test Description",
				Image = "https://example.com/img.png"
			});

			// --- CRITICAL FIX START ---
			_context.TransactionDetails.Add(new TransactionDetail
			{
				Id = Guid.NewGuid(),
				TransactionId = transaction.Id,
				CourseId = courseId,
				Price = amount
			});
			// --- CRITICAL FIX END ---

			await _context.SaveChangesAsync();

			// 3. Mock External API
			var verifyResponse = new
			{
				code = "00",
				desc = "Success",
				data = new { status = "PAID", amount = amount }
			};
			SetupMockHttpResponse(verifyResponse);

			// Act
			var result = await _service.ProcessPaymentWebhookAsync(payload);

			// Assert
			Assert.That(result, Is.True);

			var dbTransaction = await _context.Transactions.FirstAsync(t => t.Description.Contains(orderCode));
			Assert.That(dbTransaction.Status, Is.EqualTo("Success"));

			var enrollment = await _context.Enrollments.FirstOrDefaultAsync(e => e.CourseId == courseId);
			Assert.IsNotNull(enrollment, "Student should be enrolled after webhook success");
		}

		#endregion

		#region CancelPaymentAsync Tests

		[Test]
		public async Task CancelPayment_ShouldReturnTrue_WhenTransactionIsPending()
		{
			// Arrange
			var orderCode = "CANCEL123";
			var paymentMethod = "PayOS";
			var transaction = new Transaction
			{
				Id = Guid.NewGuid(),
				Status = "Pending",
				Description = $"OrderCode:{orderCode}|Test",
				PaymentMethod = paymentMethod,
			};
			_context.Transactions.Add(transaction);
			await _context.SaveChangesAsync();

			// Act
			var result = await _service.CancelPaymentAsync(orderCode);

			// Assert
			Assert.That(result, Is.True);
			Assert.That(transaction.Status, Is.EqualTo("Failed"));
		}

		[Test]
		public async Task CancelPayment_ShouldReturnFalse_WhenTransactionNotFound()
		{
			// Act
			var result = await _service.CancelPaymentAsync("NONEXISTENT");

			// Assert
			Assert.That(result, Is.False);
		}

		[Test]
		public async Task CancelPayment_ShouldReturnFalse_WhenTransactionIsNotPending()
		{
			// Arrange
			var orderCode = "DONE123";
			var paymentMethod = "PayOS";
			_context.Transactions.Add(new Transaction
			{
				Status = "Success", // Already success
				Description = $"OrderCode:{orderCode}|Test",
				PaymentMethod = paymentMethod
			});
			await _context.SaveChangesAsync();

			// Act
			var result = await _service.CancelPaymentAsync(orderCode);

			// Assert
			Assert.That(result, Is.False);
		}

		#endregion

		#region VerifyPaymentAndEnrollAsync Tests

		[Test]
		public async Task VerifySinglePayment_ShouldEnrollStudent_WhenSuccess()
		{
			// Arrange
			var ctx = await SetupValidContextAsync();
			var orderCode = "SINGLE123";

			// 1. Transaction
			var transaction = new Transaction
			{
				Id = Guid.NewGuid(),
				AccountId = ctx.accountId,
				Status = "Pending",
				Description = $"OrderCode:{orderCode}",
				PaymentMethod = "PayOS"
			};
			_context.Transactions.Add(transaction);

			_context.TransactionDetails.Add(new TransactionDetail
			{
				Id = Guid.NewGuid(),
				TransactionId = transaction.Id,
				CourseId = ctx.courseId,
				Price = 100000, // or ctx.coursePrice
				Percentage = 0,
				LecturerIncome = 0
			});

			await _context.SaveChangesAsync();

			// 2. Mock PayOS Response
			SetupMockHttpResponse(new { code = "00", data = new { status = "PAID" } });

			// Act
			var result = await _service.VerifyPaymentAndEnrollAsync(orderCode);

			// Assert
			Assert.That(result, Is.True);
			var enrollment = await _context.Enrollments.FirstOrDefaultAsync(e => e.CourseId == ctx.courseId);
			Assert.IsNotNull(enrollment);
		}

		#endregion

		#region CreateCoursePayment Tests

		[Test]
		public async Task CreateCoursePayment_ShouldReturnError_WhenCourseNotFound()
		{
			// Arrange
			var accountId = Guid.NewGuid();
			var request = new CoursePaymentRequestDto { CourseId = Guid.NewGuid() };

			// Act
			var result = await _service.CreateCoursePaymentAsync(accountId, request);

			// Assert
			Assert.That(result.Success, Is.False);
			Assert.That(result.Message, Does.Contain("Khóa học không tồn tại"));
		}

		[Test]
		public async Task CreateCoursePayment_ShouldReturnError_WhenStudentNotFound()
		{
			// Arrange
			var courseId = Guid.NewGuid();

			// SETUP: Add Course with ALL required fields
			_context.Courses.Add(new Course
			{
				Id = courseId,
				IsActive = true,
				Price = 100000,
				Title = "Test Course",
				Description = "Test Desc",
				Image = "img.png"
			});
			await _context.SaveChangesAsync();

			var request = new CoursePaymentRequestDto { CourseId = courseId };

			// Act
			var result = await _service.CreateCoursePaymentAsync(Guid.NewGuid(), request);

			// Assert
			Assert.That(result.Success, Is.False);
			Assert.That(result.Message, Is.EqualTo("Không tìm thấy thông tin học viên"));
		}

		[Test]
		public async Task CreateCoursePayment_ShouldReturnError_WhenAlreadyEnrolled()
		{
			// Arrange
			var ctx = await SetupValidContextAsync();

			// Manually enroll student
			_context.Enrollments.Add(new Enrollment
			{
				StudentId = ctx.studentId,
				CourseId = ctx.courseId
			});
			await _context.SaveChangesAsync();

			var request = new CoursePaymentRequestDto { CourseId = ctx.courseId };

			// Act
			var result = await _service.CreateCoursePaymentAsync(ctx.accountId, request);

			// Assert
			Assert.That(result.Success, Is.False);
			Assert.That(result.Message, Is.EqualTo("Bạn đã đăng ký khóa học này rồi"));
		}

		[Test]
		public async Task CreateCoursePayment_ShouldEnrollImmediately_WhenCourseIsFree()
		{
			// Arrange
			var accountId = Guid.NewGuid();
			var studentId = Guid.NewGuid();
			var courseId = Guid.NewGuid();

			_context.Students.Add(new Student { Id = studentId, AccountId = accountId });

			// SETUP: Add Free Course (Price = 0) with ALL required fields
			_context.Courses.Add(new Course
			{
				Id = courseId,
				Price = 0,
				IsActive = true,
				Title = "Free Course",
				Description = "Free Desc",
				Image = "free.png"
			});
			await _context.SaveChangesAsync();

			var request = new CoursePaymentRequestDto { CourseId = courseId };

			// Act
			var result = await _service.CreateCoursePaymentAsync(accountId, request);

			// Assert
			Assert.That(result.Success, Is.True);
			Assert.That(result.Message, Does.Contain("thành công"));

			// Verify enrollment exists
			var enrollment = await _context.Enrollments.AnyAsync(e => e.StudentId == studentId && e.CourseId == courseId);
			Assert.That(enrollment, Is.True);

			// Verify HttpClient was NEVER called (No PayOS interaction needed)
			_mockHttpMessageHandler.Protected().Verify(
				"SendAsync",
				Times.Never(),
				ItExpr.IsAny<HttpRequestMessage>(),
				ItExpr.IsAny<CancellationToken>()
			);
		}

		[Test]
		public async Task CreateCoursePayment_ShouldCallPayOS_AndReturnUrl_WhenPaidCourse()
		{
			// Arrange
			var ctx = await SetupValidContextAsync();
			var request = new CoursePaymentRequestDto { CourseId = ctx.courseId };

			// Mock PayOS API Response
			var payOsResponse = new
			{
				code = "00",
				desc = "Success",
				data = new { checkoutUrl = "https://payos.vn/checkout/test-link" }
			};
			SetupMockHttpResponse(payOsResponse);

			// Act
			var result = await _service.CreateCoursePaymentAsync(ctx.accountId, request);

			// Assert
			Assert.That(result.Success, Is.True);
			Assert.That(result.CheckoutUrl, Is.EqualTo("https://payos.vn/checkout/test-link"));

			// Verify Transaction Created in DB
			var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.AccountId == ctx.accountId);
			Assert.IsNotNull(transaction);
			Assert.That(transaction.Status, Is.EqualTo("Pending"));
			Assert.That(transaction.Amount, Is.EqualTo(500000));
		}

		#endregion

		#region GetUserEnrollments Tests

		[Test]
		public async Task GetUserEnrollments_ShouldReturnList_WhenStudentHasEnrollments()
		{
			// Arrange
			var ctx = await SetupValidContextAsync();

			// Add Enrollment
			_context.Enrollments.Add(new Enrollment
			{
				StudentId = ctx.studentId,
				CourseId = ctx.courseId,
				EnrolledAt = DateTime.Now
			});
			await _context.SaveChangesAsync();

			// Act
			var result = await _service.GetUserEnrollmentsAsync(ctx.accountId);

			// Assert
			Assert.IsNotNull(result);
			Assert.That(result.Count, Is.EqualTo(1));
			Assert.That(result[0].CourseName, Is.EqualTo("Test Course"));
			Assert.That(result[0].Price, Is.EqualTo(500000));
		}

		[Test]
		public async Task GetUserEnrollments_ShouldReturnEmpty_WhenStudentNotFound()
		{
			// Arrange
			var randomAccountId = Guid.NewGuid();

			// Act
			var result = await _service.GetUserEnrollmentsAsync(randomAccountId);

			// Assert
			Assert.IsNotNull(result);
			Assert.That(result, Is.Empty);
		}

		[Test]
		public async Task GetUserEnrollments_ShouldReturnEmpty_WhenStudentHasNoEnrollments()
		{
			// Arrange
			var ctx = await SetupValidContextAsync(); // Student exists, but no enrollments added

			// Act
			var result = await _service.GetUserEnrollmentsAsync(ctx.accountId);

			// Assert
			Assert.IsNotNull(result);
			Assert.That(result, Is.Empty);
		}

		#endregion

		// --- Helpers ---

		private async Task<(Guid accountId, Guid studentId, Guid courseId)> SetupValidContextAsync()
		{
			var accountId = Guid.NewGuid();
			var studentId = Guid.NewGuid();
			var courseId = Guid.NewGuid();

			var student = new Student { Id = studentId, AccountId = accountId };

			// FIX: Included Title, Description, Image
			var course = new Course
			{
				Id = courseId,
				Title = "Test Course",
				Price = 500000,
				IsActive = true,
				Description = "Valid Description",
				Image = "valid_image.png"
			};

			_context.Students.Add(student);
			_context.Courses.Add(course);
			await _context.SaveChangesAsync();

			return (accountId, studentId, courseId);
		}

		private void SetupMockHttpResponse(object responseContent)
		{
			var json = JsonSerializer.Serialize(responseContent);
			_mockHttpMessageHandler.Protected()
				.Setup<Task<HttpResponseMessage>>(
					"SendAsync",
					ItExpr.IsAny<HttpRequestMessage>(),
					ItExpr.IsAny<CancellationToken>()
				)
				.ReturnsAsync(new HttpResponseMessage
				{
					StatusCode = HttpStatusCode.OK,
					Content = new StringContent(json, Encoding.UTF8, "application/json")
				});
		}
	}
}