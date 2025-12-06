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
        private readonly SkillUpContext _context;
        private readonly HttpClient _httpClient;
        private readonly string _clientId;
        private readonly string _apiKey;
        private readonly string _checksumKey;
        private readonly IConfiguration _config;

        public PayOSService(SkillUpContext context, IConfiguration config, HttpClient httpClient = null)
        {
            _context = context;
            _config = config;
            _clientId = config["PayOS:ClientId"] ?? throw new ArgumentNullException("PayOS:ClientId");
            _apiKey = config["PayOS:ApiKey"] ?? throw new ArgumentNullException("PayOS:ApiKey");
            _checksumKey = config["PayOS:ChecksumKey"] ?? throw new ArgumentNullException("PayOS:ChecksumKey");

			_httpClient = httpClient ?? new HttpClient();

			// Ensure headers are added safely
			if (!_httpClient.DefaultRequestHeaders.Contains("x-client-id"))
				_httpClient.DefaultRequestHeaders.Add("x-client-id", _clientId);

			if (!_httpClient.DefaultRequestHeaders.Contains("x-api-key"))
				_httpClient.DefaultRequestHeaders.Add("x-api-key", _apiKey);
		}

        public async Task<CoursePaymentResponseDto> CreateCoursePaymentAsync(Guid accountId, CoursePaymentRequestDto request)
        {
            try
            {
                // Validate course
                var course = await _context.Courses
                    .FirstOrDefaultAsync(c => c.Id == request.CourseId && c.IsActive);

                if (course == null)
                    return ErrorResponse("Khóa học không tồn tại hoặc không khả dụng");

                // Get student
                var student = await _context.Students
                    .FirstOrDefaultAsync(s => s.AccountId == accountId);

                if (student == null)
                    return ErrorResponse("Không tìm thấy thông tin học viên");

                // Check if already enrolled
                var existingEnrollment = await _context.Enrollments
                    .FirstOrDefaultAsync(e => e.StudentId == student.Id && e.CourseId == request.CourseId);

                if (existingEnrollment != null)
                    return ErrorResponse("Bạn đã đăng ký khóa học này rồi");

                // Handle free course
                if (course.Price == 0)
                    return await EnrollFreeCourseAsync(accountId, student, course);

                // Create paid course payment
                return await CreatePaidCoursePaymentAsync(accountId, course);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PayOS] ERROR: {ex.Message}");
                return ErrorResponse($"Lỗi: {ex.Message}");
            }
        }

        public async Task<bool> VerifyPaymentAndEnrollAsync(string orderCode)
        {
            try
            {
                var transaction = await FindTransactionByOrderCodeAsync(orderCode);
                if (transaction == null) return false;

                if (transaction.Status == "Success") return true;

                if (!await VerifyPaymentWithPayOSAsync(orderCode)) return false;

                    transaction.Status = "Success";

                    var student = await _context.Students
                        .FirstOrDefaultAsync(s => s.AccountId == transaction.AccountId);

                if (student == null) return false;

                var courseId = ExtractCourseIdFromDescription(transaction.Description);
                if (!courseId.HasValue) return false;

                await EnrollStudentAndCreateTransactionDetailAsync(student.Id, courseId.Value, transaction.Id);

                    await _context.SaveChangesAsync();
                    return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PayOS] ERROR in VerifyPaymentAndEnrollAsync: {ex.Message}");
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
                    return false;

                var data = JsonDocument.Parse(dataRaw).RootElement;
                var orderCode = data.GetProperty("orderCode").GetString();

                return !string.IsNullOrEmpty(orderCode) && await VerifyPaymentAndEnrollAsync(orderCode);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PayOS] ERROR in ProcessPaymentWebhookAsync: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> CancelPaymentAsync(string orderCode)
        {
            try
            {
                var transaction = await FindTransactionByOrderCodeAsync(orderCode);
                if (transaction == null || transaction.Status != "Pending")
                    return false;

                    transaction.Status = "Failed";
                    await _context.SaveChangesAsync();
                    return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PayOS] ERROR in CancelPaymentAsync: {ex.Message}");
                return false;
            }
        }

        public async Task<List<CourseEnrollmentDto>> GetUserEnrollmentsAsync(Guid accountId)
        {
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.AccountId == accountId);

            if (student == null)
                return new List<CourseEnrollmentDto>();

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
                    return CartErrorResponse("Giỏ hàng trống");

                // Get student
                var student = await _context.Students
                    .FirstOrDefaultAsync(s => s.AccountId == accountId);

                if (student == null)
                    return CartErrorResponse("Không tìm thấy thông tin học viên");

                // Validate courses
                var courseIds = request.Items.Select(i => i.CourseId).ToList();
                var courses = await _context.Courses
                    .Where(c => courseIds.Contains(c.Id) && c.IsActive)
                    .ToListAsync();

                if (courses.Count != courseIds.Count)
                    return CartErrorResponse("Một số khóa học không tồn tại hoặc không khả dụng");

                // Check if already enrolled
                var existingEnrollments = await _context.Enrollments
                    .Where(e => e.StudentId == student.Id && courseIds.Contains(e.CourseId))
                    .Select(e => e.CourseId)
                    .ToListAsync();

                if (existingEnrollments.Any())
                    return CartErrorResponse("Bạn đã đăng ký một số khóa học trong giỏ hàng");

                // Handle free cart (total amount = 0)
                if (request.TotalAmount == 0)
                    return await EnrollFreeCartAsync(accountId, student, request, courses);

                // Create transaction
                var orderCode = GenerateOrderCode(accountId);
                var courseNames = string.Join(", ", courses.Select(c => c.Title));
                var transaction = new Transaction
                {
                    Id = Guid.NewGuid(),
                    AccountId = accountId,
                    Amount = request.TotalAmount,
                    Description = $"OrderCode:{orderCode}|CartPayment|CourseIds:{string.Join(",", courseIds)}|CourseNames:{courseNames}",
                    Status = "Pending",
                    PaymentMethod = "PayOS",
                    CreatedAt = DateTime.Now
                };

                // Store voucher info in transaction description for later use
                var voucherInfo = string.Join("|", request.Items
                    .Where(i => !string.IsNullOrEmpty(i.VoucherCode))
                    .Select(i => $"Voucher:{i.CourseId}:{i.VoucherCode}:{i.FinalPrice}"));
                
                if (!string.IsNullOrEmpty(voucherInfo))
                {
                    transaction.Description += $"|{voucherInfo}";
                }

                _context.Transactions.Add(transaction);
                await _context.SaveChangesAsync();

                // DO NOT update CartItems here - only update after payment success
                // This prevents CartItem.Price from being changed if user cancels payment

                // Create transaction details
                foreach (var item in request.Items)
                {
                    var course = courses.FirstOrDefault(c => c.Id == item.CourseId);
                    if (course != null)
                    {
                        await CreateTransactionDetailAsync(transaction.Id, item.CourseId, item.FinalPrice);
                    }
                }

                // Call PayOS API
                var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:5173";
                var paymentRequest = new
                {
                    orderCode,
                    amount = (int)request.TotalAmount,
                    description = "",
                    cancelUrl = $"{frontendUrl}/payment/result?status=cancel&orderCode={orderCode}&type=cart",
                    returnUrl = $"{frontendUrl}/payment/result?status=success&orderCode={orderCode}&type=cart"
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
                    "https://api-merchant.payos.vn/v2/payment-requests",
                    new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"));

                var responseText = await response.Content.ReadAsStringAsync();
                var payosResponse = JsonSerializer.Deserialize<JsonElement>(responseText);

                // Check for errors
                if (payosResponse.TryGetProperty("code", out var code) && code.GetString() != "00")
                {
                    var desc = payosResponse.TryGetProperty("desc", out var descProp)
                        ? descProp.GetString()
                        : "Unknown error";

                    _context.Transactions.Remove(transaction);
                    await _context.SaveChangesAsync();

                    return CartErrorResponse($"Lỗi PayOS: {desc}");
                }

                // Get checkout URL
                if (payosResponse.TryGetProperty("data", out var data) &&
                    data.TryGetProperty("checkoutUrl", out var checkoutUrl))
                {
                    return new CartPaymentResponseDto
                    {
                        Success = true,
                        CheckoutUrl = checkoutUrl.GetString(),
                        OrderCode = orderCode.ToString(),
                        Message = "Tạo thanh toán thành công"
                    };
                }

                // No checkout URL
                _context.Transactions.Remove(transaction);
                await _context.SaveChangesAsync();

                return CartErrorResponse($"Không thể lấy link thanh toán. Response: {responseText}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PayOS] ERROR in CreateCartPaymentAsync: {ex.Message}");
                return CartErrorResponse($"Lỗi: {ex.Message}");
            }
        }

        public async Task<bool> VerifyCartPaymentAndEnrollAsync(string orderCode)
        {
            try
            {
                var transaction = await FindTransactionByOrderCodeAsync(orderCode);
                if (transaction == null) return false;

                if (transaction.Status == "Success") return true;

                if (!await VerifyPaymentWithPayOSAsync(orderCode)) return false;

                transaction.Status = "Success";

                var student = await _context.Students
                    .FirstOrDefaultAsync(s => s.AccountId == transaction.AccountId);

                if (student == null) return false;

                // Extract course IDs from description
                var courseIds = ExtractCourseIdsFromDescription(transaction.Description);
                if (!courseIds.Any()) return false;

                // Update CartItems with final price and voucher info AFTER payment success
                var cart = await _context.Carts
                    .Include(c => c.CartItems)
                    .FirstOrDefaultAsync(c => c.StudentId == student.Id);

                // Extract voucher info from transaction description once
                var voucherInfoParts = transaction.Description?.Split('|')
                    .Where(p => p.StartsWith("Voucher:"))
                    .ToList() ?? new List<string>();

                // Get final prices from voucher info for both CartItem update and TransactionDetail
                var courseFinalPrices = new Dictionary<Guid, decimal>();

                if (cart != null)
                {
                    foreach (var voucherInfo in voucherInfoParts)
                    {
                        // Format: Voucher:{CourseId}:{VoucherCode}:{FinalPrice}
                        var parts = voucherInfo.Replace("Voucher:", "").Split(':');
                        if (parts.Length >= 3 && Guid.TryParse(parts[0], out var courseId))
                        {
                            var cartItem = cart.CartItems?.FirstOrDefault(ci => ci.CourseId == courseId);
                            if (cartItem != null)
                            {
                                // Update CartItem Price with final price (after discount)
                                if (decimal.TryParse(parts[2], out var finalPrice))
                                {
                                    cartItem.Price = finalPrice;
                                    courseFinalPrices[courseId] = finalPrice;
                                }

                                // Find and set voucher ID
                                if (parts.Length >= 2 && !string.IsNullOrEmpty(parts[1]))
                                {
                                    var voucher = await _context.Vouchers
                                        .FirstOrDefaultAsync(v => v.CouponCode == parts[1] && v.CourseId == courseId);
                                    if (voucher != null)
                                    {
                                        cartItem.VoucherId = voucher.Id;
                                    }
                                }
                            }
                        }
                    }
                    await _context.SaveChangesAsync();
                }

                // Enroll student in all courses and create transaction details with final prices
                // Extract final prices for courses that don't have vouchers (if any)
                foreach (var voucherInfo in voucherInfoParts)
                {
                    var parts = voucherInfo.Replace("Voucher:", "").Split(':');
                    if (parts.Length >= 3 && Guid.TryParse(parts[0], out var courseId))
                    {
                        if (!courseFinalPrices.ContainsKey(courseId) && decimal.TryParse(parts[2], out var finalPrice))
                        {
                            courseFinalPrices[courseId] = finalPrice;
                        }
                    }
                }

                foreach (var courseId in courseIds)
                {
                    await EnrollStudentAndCreateTransactionDetailAsync(student.Id, courseId, transaction.Id, 
                        courseFinalPrices.ContainsKey(courseId) ? courseFinalPrices[courseId] : null);
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PayOS] ERROR in VerifyCartPaymentAndEnrollAsync: {ex.Message}");
                return false;
            }
        }

        #region Private Helper Methods

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
                Description = $"Free Cart Enrollment|CourseIds:{string.Join(",", courseIds)}|CourseNames:{courseNames}",
                Status = "Success",
                PaymentMethod = "Free",
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
                Description = $"Free Course Enrollment|CourseId:{course.Id}|CourseName:{course.Title}",
                Status = "Success",
                PaymentMethod = "Free",
                CreatedAt = DateTime.Now
            };
            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            // Create transaction detail
            await CreateTransactionDetailAsync(transaction.Id, course.Id, 0);

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
                Description = $"OrderCode:{orderCode}|CourseId:{course.Id}|CourseName:{course.Title}",
                Status = "Pending",
                PaymentMethod = "PayOS",
                CreatedAt = DateTime.Now
            };

            _context.Transactions.Add(transaction);
            await _context.SaveChangesAsync();

            // Create transaction detail
            await CreateTransactionDetailAsync(transaction.Id, course.Id, course.Price);

            // Call PayOS API
            var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:5173";
            var paymentRequest = new
            {
                orderCode,
                amount = (int)course.Price,
                description = "",
                cancelUrl = $"{frontendUrl}/payment/result?status=cancel&orderCode={orderCode}",
                returnUrl = $"{frontendUrl}/payment/result?status=success&orderCode={orderCode}"
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
                "https://api-merchant.payos.vn/v2/payment-requests",
                new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"));

            var responseText = await response.Content.ReadAsStringAsync();
            var payosResponse = JsonSerializer.Deserialize<JsonElement>(responseText);

            // Check for errors
            if (payosResponse.TryGetProperty("code", out var code) && code.GetString() != "00")
            {
                var desc = payosResponse.TryGetProperty("desc", out var descProp)
                    ? descProp.GetString()
                    : "Unknown error";

                _context.Transactions.Remove(transaction);
                await _context.SaveChangesAsync();

                return ErrorResponse($"Lỗi PayOS: {desc}");
            }

            // Get checkout URL
            if (payosResponse.TryGetProperty("data", out var data) &&
                data.TryGetProperty("checkoutUrl", out var checkoutUrl))
            {
                return new CoursePaymentResponseDto
                {
                    Success = true,
                    CheckoutUrl = checkoutUrl.GetString(),
                    OrderCode = orderCode.ToString(),
                    Message = "Tạo thanh toán thành công"
                };
            }

            // No checkout URL
            _context.Transactions.Remove(transaction);
            await _context.SaveChangesAsync();

            return ErrorResponse($"Không thể lấy link thanh toán. Response: {responseText}");
        }

        private async Task CreateTransactionDetailAsync(Guid transactionId, Guid courseId, decimal price)
        {
            try
            {
                var existing = await _context.TransactionDetails
                    .FirstOrDefaultAsync(td => td.TransactionId == transactionId && td.CourseId == courseId);

                if (existing == null)
                {
                    _context.TransactionDetails.Add(new TransactionDetail
                    {
                        Id = Guid.NewGuid(),
                        TransactionId = transactionId,
                        CourseId = courseId,
                        Price = price
                    });
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PayOS] ERROR creating TransactionDetail: {ex.Message}");
            }
        }

        private async Task EnrollStudentAndCreateTransactionDetailAsync(Guid studentId, Guid courseId, Guid transactionId, decimal? finalPrice = null)
        {
            var existingEnrollment = await _context.Enrollments
                .FirstOrDefaultAsync(e => e.StudentId == studentId && e.CourseId == courseId);

            var course = await _context.Courses.FindAsync(courseId);
            if (course == null) return;

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

            // Use final price (after discount) if provided, otherwise use course price
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
            var response = await _httpClient.GetAsync($"https://api-merchant.payos.vn/v2/payment-requests/{orderCode}");
            var responseText = await response.Content.ReadAsStringAsync();
            var payosResponse = JsonSerializer.Deserialize<JsonElement>(responseText);

            return payosResponse.TryGetProperty("data", out var data) &&
                   data.TryGetProperty("status", out var status) &&
                   status.GetString() == "PAID";
        }

        private Guid? ExtractCourseIdFromDescription(string? description)
        {
            if (string.IsNullOrEmpty(description)) return null;

            var descParts = description.Split('|');
            var courseIdPart = descParts.FirstOrDefault(p => p.StartsWith("CourseId:"));

            if (courseIdPart != null && Guid.TryParse(courseIdPart.Replace("CourseId:", ""), out var courseId))
                return courseId;

            return null;
        }

        private List<Guid> ExtractCourseIdsFromDescription(string? description)
        {
            var courseIds = new List<Guid>();
            if (string.IsNullOrEmpty(description)) return courseIds;

            var descParts = description.Split('|');
            var courseIdsPart = descParts.FirstOrDefault(p => p.StartsWith("CourseIds:"));

            if (courseIdsPart != null)
            {
                var idsString = courseIdsPart.Replace("CourseIds:", "");
                var ids = idsString.Split(',');
                foreach (var id in ids)
                {
                    if (Guid.TryParse(id.Trim(), out var courseId))
                    {
                        courseIds.Add(courseId);
                    }
                }
            }

            return courseIds;
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

        #endregion
    }
}
