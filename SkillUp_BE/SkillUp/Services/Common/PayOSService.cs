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

        public PayOSService(SkillUpContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
            _clientId = config["PayOS:ClientId"] ?? throw new ArgumentNullException("PayOS:ClientId");
            _apiKey = config["PayOS:ApiKey"] ?? throw new ArgumentNullException("PayOS:ApiKey");
            _checksumKey = config["PayOS:ChecksumKey"] ?? throw new ArgumentNullException("PayOS:ChecksumKey");

            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Add("x-client-id", _clientId);
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

        #region Private Helper Methods

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

        private async Task EnrollStudentAndCreateTransactionDetailAsync(Guid studentId, Guid courseId, Guid transactionId)
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

            await CreateTransactionDetailAsync(transactionId, courseId, course.Price);
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
