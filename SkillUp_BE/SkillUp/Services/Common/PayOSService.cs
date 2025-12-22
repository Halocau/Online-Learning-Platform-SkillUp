using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.DTOs.PayOS;
using SkillUp.BussinessObjects.Models;
using SkillUp.Services.Interfaces;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace SkillUp.Services.Common
{
    public class PayOSService : IPayOSService
    {
        #region Constants

        private const string PAYOS_API_BASE_URL = "https://api-merchant.payos.vn/v2/payment-requests";
        private const string STATUS_SUCCESS = "Success";
        private const string STATUS_PENDING = "Pending";
        private const string STATUS_FAILED = "Failed";
        private const string PAYMENT_METHOD_PAYOS = "PayOS";
        private const string PAYMENT_METHOD_FREE = "Free";
        private const string PAYOS_STATUS_PAID = "PAID";
        private const string PAYOS_CODE_SUCCESS = "00";

        #endregion

        #region Fields

        private readonly SkillUpContext _context;
        private readonly HttpClient _httpClient;
        private readonly string _clientId;
        private readonly string _apiKey;
        private readonly string _checksumKey;
        private readonly IConfiguration _config;
        private readonly IEmailService _emailService;

        #endregion

        #region Constructor

        public PayOSService(SkillUpContext context, IConfiguration config, IEmailService emailService, HttpClient httpClient = null)
        {
            _context = context;
            _config = config;
            _emailService = emailService;
            _clientId = config["PayOS:ClientId"] ?? throw new ArgumentNullException("PayOS:ClientId");
            _apiKey = config["PayOS:ApiKey"] ?? throw new ArgumentNullException("PayOS:ApiKey");
            _checksumKey = config["PayOS:ChecksumKey"] ?? throw new ArgumentNullException("PayOS:ChecksumKey");

            _httpClient = httpClient ?? new HttpClient();
            SetupHttpClientHeaders();
        }

        private void SetupHttpClientHeaders()
        {
            if (!_httpClient.DefaultRequestHeaders.Contains("x-client-id"))
            {
                _httpClient.DefaultRequestHeaders.Add("x-client-id", _clientId);
            }

            if (!_httpClient.DefaultRequestHeaders.Contains("x-api-key"))
            {
                _httpClient.DefaultRequestHeaders.Add("x-api-key", _apiKey);
            }
        }

        #endregion

        #region Public Methods

        public async Task<CoursePaymentResponseDto> CreateCoursePaymentAsync(Guid accountId, CoursePaymentRequestDto request)
        {
            try
            {
                var course = await ValidateAndGetCourseAsync(request.CourseId);
                if (course == null)
                {
                    return ErrorResponse("Khóa học không tồn tại hoặc không khả dụng");
                }

                var student = await GetStudentByAccountIdAsync(accountId);
                if (student == null)
                {
                    return ErrorResponse("Không tìm thấy thông tin học viên");
                }

                if (await IsStudentEnrolledAsync(student.Id, request.CourseId))
                {
                    return ErrorResponse("Bạn đã đăng ký khóa học này rồi");
                }

                if (course.Price == 0)
                {
                    return await EnrollFreeCourseAsync(accountId, student, course);
                }

                return await CreatePaidCoursePaymentAsync(accountId, course);
            }
            catch (Exception ex)
            {
                LogError("CreateCoursePaymentAsync", ex);
                return ErrorResponse($"Lỗi: {ex.Message}");
            }
        }

        public async Task<bool> VerifyPaymentAndEnrollAsync(string orderCode)
        {
            try
            {
                var transaction = await FindTransactionByOrderCodeAsync(orderCode);
                if (transaction == null)
                {
                    return false;
                }

                if (transaction.Status == STATUS_SUCCESS)
                {
                    return true;
                }

                if (!await VerifyPaymentWithPayOSAsync(orderCode))
                {
                    return false;
                }

                transaction.Status = STATUS_SUCCESS;

                var student = await GetStudentByAccountIdAsync(transaction.AccountId);
                if (student == null)
                {
                    return false;
                }

                var courseId = await GetCourseIdFromTransactionAsync(transaction.Id);
                if (!courseId.HasValue)
                {
                    return false;
                }

                await EnrollStudentAndCreateTransactionDetailAsync(student.Id, courseId.Value, transaction.Id);
                await _context.SaveChangesAsync();

                await SendPurchaseEmailAsync(student, courseId.Value, transaction);
                return true;
            }
            catch (Exception ex)
            {
                LogError("VerifyPaymentAndEnrollAsync", ex);
                return false;
            }
        }

        public async Task<bool> ProcessPaymentWebhookAsync(JsonElement payload)
        {
            try
            {
                var dataRaw = payload.GetProperty("data").ToString();
                var signature = payload.GetProperty("signature").GetString();

                if (ComputeSignature(dataRaw, _checksumKey) != signature)
                {
                    return false;
                }

                var data = JsonDocument.Parse(dataRaw).RootElement;
                var orderCode = data.GetProperty("orderCode").GetString();

                return !string.IsNullOrEmpty(orderCode) && await VerifyPaymentAndEnrollAsync(orderCode);
            }
            catch (Exception ex)
            {
                LogError("ProcessPaymentWebhookAsync", ex);
                return false;
            }
        }

        public async Task<bool> CancelPaymentAsync(string orderCode)
        {
            try
            {
                var transaction = await FindTransactionByOrderCodeAsync(orderCode);
                if (transaction == null || transaction.Status != STATUS_PENDING)
                {
                    return false;
                }

                transaction.Status = STATUS_FAILED;
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                LogError("CancelPaymentAsync", ex);
                return false;
            }
        }

        public async Task<List<CourseEnrollmentDto>> GetUserEnrollmentsAsync(Guid accountId)
        {
            var student = await GetStudentByAccountIdAsync(accountId);
            if (student == null)
            {
                return new List<CourseEnrollmentDto>();
            }

            return await _context.Enrollments
                .Include(e => e.Course)
                .Where(e => e.StudentId == student.Id)
                .OrderByDescending(e => e.EnrolledAt)
                .Select(e => new CourseEnrollmentDto
                {
                    CourseId = e.CourseId,
                    CourseName = e.Course.Title,
                    Price = e.Course.Price,
                    EnrolledAt = e.EnrolledAt
                })
                .ToListAsync();
        }

        public async Task<CartPaymentResponseDto> CreateCartPaymentAsync(Guid accountId, CartPaymentRequestDto request)
        {
            try
            {
                if (request.Items == null || !request.Items.Any())
                {
                    return CartErrorResponse("Giỏ hàng trống");
                }

                var student = await GetStudentByAccountIdAsync(accountId);
                if (student == null)
                {
                    return CartErrorResponse("Không tìm thấy thông tin học viên");
                }

                var courseIds = request.Items.Select(i => i.CourseId).ToList();
                var courses = await ValidateCoursesAsync(courseIds);
                if (courses == null)
                {
                    return CartErrorResponse("Một số khóa học không tồn tại hoặc không khả dụng");
                }

                if (await HasExistingEnrollmentsAsync(student.Id, courseIds))
                {
                    return CartErrorResponse("Bạn đã đăng ký một số khóa học trong giỏ hàng");
                }

                if (request.TotalAmount == 0)
                {
                    return await EnrollFreeCartAsync(accountId, student, request, courses);
                }

                var orderCode = GenerateOrderCode(accountId);
                var transaction = await CreateCartTransactionAsync(accountId, request, courseIds, courses, orderCode);
                await CreateCartTransactionDetailsAsync(transaction.Id, request.Items, courses);

                var payosResponse = await CallPayOSApiAsync(orderCode, request.TotalAmount, isCart: true);
                
                if (!payosResponse.Success)
                {
                    await RollbackTransactionAsync(transaction.Id);
                    return CartErrorResponse(payosResponse.ErrorMessage);
                }

                return new CartPaymentResponseDto
                {
                    Success = true,
                    CheckoutUrl = payosResponse.CheckoutUrl,
                    OrderCode = orderCode.ToString(),
                    Message = "Tạo thanh toán thành công"
                };
            }
            catch (Exception ex)
            {
                LogError("CreateCartPaymentAsync", ex);
                return CartErrorResponse($"Lỗi: {ex.Message}");
            }
        }

        public async Task<bool> VerifyCartPaymentAndEnrollAsync(string orderCode)
        {
            try
            {
                var transaction = await FindTransactionByOrderCodeAsync(orderCode);
                if (transaction == null)
                {
                    return false;
                }

                if (transaction.Status == STATUS_SUCCESS)
                {
                    return true;
                }

                if (!await VerifyPaymentWithPayOSAsync(orderCode))
                {
                    return false;
                }

                transaction.Status = STATUS_SUCCESS;

                var student = await GetStudentByAccountIdAsync(transaction.AccountId);
                if (student == null)
                {
                    return false;
                }

                var courseIds = await GetCourseIdsFromTransactionAsync(transaction.Id);
                if (!courseIds.Any())
                {
                    return false;
                }

                var courseFinalPrices = await UpdateCartItemsWithVoucherInfoAsync(student.Id, transaction.Id);
                await EnrollStudentInCoursesAsync(student.Id, courseIds, transaction.Id, courseFinalPrices);
                await ClearCartAsync(student.Id);

                await SendCartPurchaseEmailAsync(student, courseIds, transaction, courseFinalPrices);
                return true;
            }
            catch (Exception ex)
            {
                LogError("VerifyCartPaymentAndEnrollAsync", ex);
                return false;
            }
        }

        #endregion

        #region Private Helper Methods

        #region Private Helper Methods

        #region Validation Helpers

        private async Task<Course?> ValidateAndGetCourseAsync(Guid courseId)
        {
            return await _context.Courses
                .FirstOrDefaultAsync(c => c.Id == courseId && c.IsActive);
        }

        private async Task<List<Course>?> ValidateCoursesAsync(List<Guid> courseIds)
        {
            var courses = await _context.Courses
                .Where(c => courseIds.Contains(c.Id) && c.IsActive)
                .ToListAsync();

            return courses.Count == courseIds.Count ? courses : null;
        }

        private async Task<Student?> GetStudentByAccountIdAsync(Guid accountId)
        {
            return await _context.Students
                .FirstOrDefaultAsync(s => s.AccountId == accountId);
        }

        private async Task<bool> IsStudentEnrolledAsync(Guid studentId, Guid courseId)
        {
            return await _context.Enrollments
                .AnyAsync(e => e.StudentId == studentId && e.CourseId == courseId);
        }

        private async Task<bool> HasExistingEnrollmentsAsync(Guid studentId, List<Guid> courseIds)
        {
            return await _context.Enrollments
                .AnyAsync(e => e.StudentId == studentId && courseIds.Contains(e.CourseId));
        }

        #endregion

        #region Transaction Helpers

        private async Task<Transaction> CreateCartTransactionAsync(Guid accountId, CartPaymentRequestDto request, List<Guid> courseIds, List<Course> courses, long orderCode)
        {
            // Chỉ lưu OrderCode trong Description, courseIds sẽ lấy từ TransactionDetails
            var description = $"OrderCode:{orderCode}";

            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                AccountId = accountId,
                Amount = request.TotalAmount,
                Description = description,
                Status = STATUS_PENDING,
                PaymentMethod = PAYMENT_METHOD_PAYOS,
                CreatedAt = DateTime.Now
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();
            return transaction;
        }

        private async Task CreateCartTransactionDetailsAsync(Guid transactionId, List<CartPaymentItemDto> items, List<Course> courses)
        {
            foreach (var item in items)
            {
                var course = courses.FirstOrDefault(c => c.Id == item.CourseId);
                if (course != null)
                {
                    await CreateTransactionDetailAsync(transactionId, item.CourseId, item.FinalPrice);
                }
            }
        }

        private async Task RollbackTransactionAsync(Guid transactionId)
        {
            var transaction = await _context.Transactions.FindAsync(transactionId);
            if (transaction != null)
            {
                _context.Transactions.Remove(transaction);
                await _context.SaveChangesAsync();
            }
        }

        #endregion

        #region PayOS API Helpers

        private async Task<(bool Success, string? CheckoutUrl, string? ErrorMessage)> CallPayOSApiAsync(long orderCode, decimal amount, bool isCart = false)
        {
            try
            {
                var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:5173";
                var typeParam = isCart ? "&type=cart" : "";
                
                var paymentRequest = new
                {
                    orderCode,
                    amount = (int)amount,
                    description = "",
                    cancelUrl = $"{frontendUrl}/payment/result?status=cancel&orderCode={orderCode}{typeParam}",
                    returnUrl = $"{frontendUrl}/payment/result?status=success&orderCode={orderCode}{typeParam}"
                };

                var signature = ComputeSignature(
                    $"amount={paymentRequest.amount}&cancelUrl={paymentRequest.cancelUrl}&description={paymentRequest.description}&orderCode={paymentRequest.orderCode}&returnUrl={paymentRequest.returnUrl}",
                    _checksumKey);

                var payload = new
                {
                    paymentRequest.orderCode,
                    paymentRequest.amount,
                    paymentRequest.description,
                    paymentRequest.cancelUrl,
                    paymentRequest.returnUrl,
                    signature
                };

                var response = await _httpClient.PostAsync(
                    PAYOS_API_BASE_URL,
                    new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"));

                var responseText = await response.Content.ReadAsStringAsync();
                var payosResponse = JsonSerializer.Deserialize<JsonElement>(responseText);

                if (payosResponse.TryGetProperty("code", out var code) && code.GetString() != PAYOS_CODE_SUCCESS)
                {
                    var desc = payosResponse.TryGetProperty("desc", out var descProp)
                        ? descProp.GetString()
                        : "Unknown error";
                    return (false, null, $"Lỗi PayOS: {desc}");
                }

                if (payosResponse.TryGetProperty("data", out var data) &&
                    data.TryGetProperty("checkoutUrl", out var checkoutUrl))
                {
                    return (true, checkoutUrl.GetString(), null);
                }

                return (false, null, $"Không thể lấy link thanh toán. Response: {responseText}");
            }
            catch (Exception ex)
            {
                return (false, null, $"Lỗi: {ex.Message}");
            }
        }

        #endregion

        #region Cart Helpers

        private async Task<Dictionary<Guid, decimal>> UpdateCartItemsWithVoucherInfoAsync(Guid studentId, Guid transactionId)
        {
            var courseFinalPrices = new Dictionary<Guid, decimal>();
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.StudentId == studentId);

            if (cart == null)
            {
                return courseFinalPrices;
            }

            // Lấy voucher info từ TransactionDetails (Price đã được discount)
            var transactionDetails = await _context.TransactionDetails
                .Where(td => td.TransactionId == transactionId)
                .ToListAsync();

            foreach (var detail in transactionDetails)
            {
                var cartItem = cart.CartItems?.FirstOrDefault(ci => ci.CourseId == detail.CourseId);
                if (cartItem != null)
                {
                    // Update CartItem Price với final price từ TransactionDetail
                    cartItem.Price = detail.Price;
                    courseFinalPrices[detail.CourseId] = detail.Price;
                }
            }

            await _context.SaveChangesAsync();
            return courseFinalPrices;
        }

        private async Task EnrollStudentInCoursesAsync(Guid studentId, List<Guid> courseIds, Guid transactionId, Dictionary<Guid, decimal> courseFinalPrices)
        {
            foreach (var courseId in courseIds)
            {
                decimal? finalPrice = courseFinalPrices.TryGetValue(courseId, out var price) ? price : null;
                await EnrollStudentAndCreateTransactionDetailAsync(studentId, courseId, transactionId, finalPrice);
            }
            await _context.SaveChangesAsync();
        }

        private async Task ClearCartAsync(Guid studentId)
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.StudentId == studentId);

            if (cart != null && cart.CartItems != null && cart.CartItems.Any())
            {
                _context.CartItems.RemoveRange(cart.CartItems);
                await _context.SaveChangesAsync();
            }
        }

        #endregion

        #region Utility Helpers

        private void LogError(string methodName, Exception ex)
        {
            Console.WriteLine($"[PayOS] ERROR in {methodName}: {ex.Message}");
        }

        #endregion

        private async Task<CartPaymentResponseDto> EnrollFreeCartAsync(Guid accountId, Student student, CartPaymentRequestDto request, List<Course> courses)
        {
            // Update CartItems with final price and voucher info
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.StudentId == student.Id);

            if (cart != null)
            {
                foreach (var item in request.Items)
                {
                    var cartItem = cart.CartItems?.FirstOrDefault(ci => ci.CourseId == item.CourseId);
                    if (cartItem != null)
                    {
                        // Update CartItem Price with final price (after discount) when voucher is used
                        cartItem.Price = item.FinalPrice;
                        
                        // Find voucher by code if provided
                        if (!string.IsNullOrEmpty(item.VoucherCode))
                        {
                            var voucher = await _context.Vouchers
                                .FirstOrDefaultAsync(v => v.CouponCode == item.VoucherCode && v.CourseId == item.CourseId);
                            if (voucher != null)
                            {
                                cartItem.VoucherId = voucher.Id;
                            }
                        }
                    }
                }
                await _context.SaveChangesAsync();
            }

            // Create enrollments for all courses
            var courseIds = request.Items.Select(i => i.CourseId).ToList();
            var courseNames = string.Join(", ", courses.Select(c => c.Title));
            
            foreach (var courseId in courseIds)
            {
                var course = courses.FirstOrDefault(c => c.Id == courseId);
                if (course != null)
                {
                    var existingEnrollment = await _context.Enrollments
                        .FirstOrDefaultAsync(e => e.StudentId == student.Id && e.CourseId == courseId);

                    if (existingEnrollment == null)
                    {
                        var enrollment = new Enrollment
                        {
                            Id = Guid.NewGuid(),
                            StudentId = student.Id,
                            CourseId = courseId,
                            EnrolledAt = DateTime.Now
                        };
                        _context.Enrollments.Add(enrollment);
                        course.EnrollmentCount++;
                    }
                }
            }

            // Create transaction
            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                AccountId = accountId,
                Amount = 0,
                Description = "Free Cart Enrollment",
                Status = STATUS_SUCCESS,
                PaymentMethod = PAYMENT_METHOD_FREE,
                CreatedAt = DateTime.Now
            };
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            // Create transaction details
            foreach (var item in request.Items)
            {
                var course = courses.FirstOrDefault(c => c.Id == item.CourseId);
                if (course != null)
                {
                    await CreateTransactionDetailAsync(transaction.Id, item.CourseId, item.FinalPrice);
                }
            }

            // Clear cart after enrollment
            if (cart != null && cart.CartItems != null && cart.CartItems.Any())
            {
                _context.CartItems.RemoveRange(cart.CartItems);
                await _context.SaveChangesAsync();
            }

            // Gửi email xác nhận mua khóa học miễn phí (nhiều khóa học)
            var freeCourseIds = request.Items.Select(i => i.CourseId).ToList();
            await SendCartPurchaseEmailAsync(student, freeCourseIds, transaction, null);

            return new CartPaymentResponseDto
            {
                Success = true,
                Message = $"Đăng ký {courses.Count} khóa học miễn phí thành công",
                IsFreeCart = true
            };
        }

        private async Task<CoursePaymentResponseDto> EnrollFreeCourseAsync(Guid accountId, Student student, Course course)
        {
            // Create enrollment
            var enrollment = new Enrollment
            {
                Id = Guid.NewGuid(),
                StudentId = student.Id,
                CourseId = course.Id,
                EnrolledAt = DateTime.Now
            };
            _context.Enrollments.Add(enrollment);
            course.EnrollmentCount++;

            // Create transaction
            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                AccountId = accountId,
                Amount = 0,
                Description = "Free Course Enrollment",
                Status = STATUS_SUCCESS,
                PaymentMethod = PAYMENT_METHOD_FREE,
                CreatedAt = DateTime.Now
            };
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            // Create transaction detail
            await CreateTransactionDetailAsync(transaction.Id, course.Id, 0);

            // Gửi email xác nhận mua khóa học miễn phí
            await SendPurchaseEmailAsync(student, course.Id, transaction);

            return new CoursePaymentResponseDto
            {
                Success = true,
                Message = "Đăng ký khóa học miễn phí thành công",
                IsFreeCourse = true
            };
        }

        private async Task<CoursePaymentResponseDto> CreatePaidCoursePaymentAsync(Guid accountId, Course course)
        {
            var orderCode = GenerateOrderCode(accountId);
            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                AccountId = accountId,
                Amount = course.Price,
                Description = $"OrderCode:{orderCode}",
                Status = STATUS_PENDING,
                PaymentMethod = PAYMENT_METHOD_PAYOS,
                CreatedAt = DateTime.Now
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            await CreateTransactionDetailAsync(transaction.Id, course.Id, course.Price);

            var payosResponse = await CallPayOSApiAsync(orderCode, course.Price, isCart: false);
            
            if (!payosResponse.Success)
            {
                await RollbackTransactionAsync(transaction.Id);
                return ErrorResponse(payosResponse.ErrorMessage ?? "Lỗi không xác định");
            }

            return new CoursePaymentResponseDto
            {
                Success = true,
                CheckoutUrl = payosResponse.CheckoutUrl ?? "",
                OrderCode = orderCode.ToString(),
                Message = "Tạo thanh toán thành công"
            };
        }

        private async Task CreateTransactionDetailAsync(Guid transactionId, Guid courseId, decimal price)
        {
            try
            {
                var existing = await _context.TransactionDetails
                    .FirstOrDefaultAsync(td => td.TransactionId == transactionId && td.CourseId == courseId);

                // Lấy Course với Lecturer để lấy Percentage
                var course = await _context.Courses
                    .Include(c => c.Lecturer)
                    .FirstOrDefaultAsync(c => c.Id == courseId);

                if (course == null)
                {
                    return;
                }

                var percentage = course.Lecturer?.Percentage ?? 0;

                var lecturerIncome = percentage > 0 
                    ? (decimal?)(price * (decimal)percentage / 100) 
                    : 0;

                if (existing == null)
                {
                    // Tạo mới TransactionDetail
                    _context.TransactionDetails.Add(new TransactionDetail
                    {
                        Id = Guid.NewGuid(),
                        TransactionId = transactionId,
                        CourseId = courseId,
                        Price = price,
                        Percentage = percentage > 0 ? percentage : 0,
                        LecturerIncome = lecturerIncome
                    });
                }
                else
                {
                    // Update TransactionDetail nếu đã tồn tại (trường hợp có discount)
                    existing.Price = price;
                    existing.Percentage = percentage > 0 ? percentage : 0;
                    existing.LecturerIncome = lecturerIncome;
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                LogError("CreateTransactionDetailAsync", ex);
            }
        }

        private async Task EnrollStudentAndCreateTransactionDetailAsync(Guid studentId, Guid courseId, Guid transactionId, decimal? finalPrice = null)
        {
            var existingEnrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == courseId);

            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
            {
                return;
            }

            if (existingEnrollment == null)
            {
                _context.Enrollments.Add(new Enrollment
                {
                    Id = Guid.NewGuid(),
                    StudentId = studentId,
                    CourseId = courseId,
                    EnrolledAt = DateTime.Now
                });
                course.EnrollmentCount++;
            }

            var priceToUse = finalPrice ?? course.Price;
            await CreateTransactionDetailAsync(transactionId, courseId, priceToUse);
        }

        private async Task<Transaction?> FindTransactionByOrderCodeAsync(string orderCode)
        {
            return await _context.Transactions
                .FirstOrDefaultAsync(t => t.Description != null && t.Description.Contains($"OrderCode:{orderCode}"));
        }

        private async Task<bool> VerifyPaymentWithPayOSAsync(string orderCode)
        {
            var response = await _httpClient.GetAsync($"{PAYOS_API_BASE_URL}/{orderCode}");
            var responseText = await response.Content.ReadAsStringAsync();
            var payosResponse = JsonSerializer.Deserialize<JsonElement>(responseText);

            return payosResponse.TryGetProperty("data", out var data) &&
                   data.TryGetProperty("status", out var status) &&
                   status.GetString() == PAYOS_STATUS_PAID;
        }

        private async Task<Guid?> GetCourseIdFromTransactionAsync(Guid transactionId)
        {
            var transactionDetail = await _context.TransactionDetails
                .FirstOrDefaultAsync(td => td.TransactionId == transactionId);

            return transactionDetail?.CourseId;
        }

        private async Task<List<Guid>> GetCourseIdsFromTransactionAsync(Guid transactionId)
        {
            return await _context.TransactionDetails
                .Where(td => td.TransactionId == transactionId)
                .Select(td => td.CourseId)
                .ToListAsync();
        }

        private CartPaymentResponseDto CartErrorResponse(string message)
        {
            return new CartPaymentResponseDto
            {
                Success = false,
                Message = message
            };
        }

        private long GenerateOrderCode(Guid accountId)
        {
            long timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            int accountHash = Math.Abs(accountId.GetHashCode()) % 100000;
            return accountHash * 10000000L + timestamp % 10000000L;
        }

        private CoursePaymentResponseDto ErrorResponse(string message)
        {
            return new CoursePaymentResponseDto
            {
                Success = false,
                Message = message
            };
        }

        private string ComputeSignature(string raw, string key)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
            return BitConverter.ToString(hmac.ComputeHash(Encoding.UTF8.GetBytes(raw)))
                .Replace("-", "").ToLower();
        }

        private async Task SendPurchaseEmailAsync(Student student, Guid courseId, Transaction transaction)
        {
            try
            {
                var account = await _context.Accounts.FindAsync(student.AccountId);
                if (account == null || string.IsNullOrEmpty(account.Email))
                {
                    return;
                }

                var course = await _context.Courses.FindAsync(courseId);
                if (course == null)
                {
                    return;
                }

                var courses = new List<(string CourseName, Guid CourseId, decimal Price, string ImageUrl)>
                {
                    (course.Title, course.Id, transaction.Amount, course.Image)
                };

                await _emailService.SendCoursePurchaseEmailAsync(
                    account.Email,
                    account.Fullname ?? "Học viên",
                    courses,
                    transaction.Amount,
                    transaction.PaymentMethod ?? PAYMENT_METHOD_PAYOS
                );
            }
            catch (Exception ex)
            {
                LogError("SendPurchaseEmailAsync", ex);
                // Không throw exception để không ảnh hưởng đến quá trình thanh toán
            }
        }

        private async Task SendCartPurchaseEmailAsync(Student student, List<Guid> courseIds, Transaction transaction, Dictionary<Guid, decimal>? courseFinalPrices)
        {
            try
            {
                var account = await _context.Accounts.FindAsync(student.AccountId);
                if (account == null || string.IsNullOrEmpty(account.Email))
                {
                    return;
                }

                var courses = await _context.Courses
                    .Where(c => courseIds.Contains(c.Id))
                    .ToListAsync();

                if (!courses.Any())
                {
                    return;
                }

                var courseList = courses.Select(c =>
                {
                    var finalPrice = courseFinalPrices?.ContainsKey(c.Id) == true
                        ? courseFinalPrices[c.Id]
                        : c.Price;
                    return (c.Title, c.Id, finalPrice, c.Image);
                }).ToList();

                var totalAmount = courseList.Sum(c => c.Item3);

                await _emailService.SendCoursePurchaseEmailAsync(
                    account.Email,
                    account.Fullname ?? "Học viên",
                    courseList,
                    totalAmount,
                    transaction.PaymentMethod ?? PAYMENT_METHOD_PAYOS
                );
            }
            catch (Exception ex)
            {
                LogError("SendCartPurchaseEmailAsync", ex);
                // Không throw exception để không ảnh hưởng đến quá trình thanh toán
            }
        }

        #endregion

        #endregion
    }
}
