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
                Console.WriteLine($"[PayOS] Start CreateCoursePayment - AccountId: {accountId}, CourseId: {request.CourseId}");

                // Kiểm tra khóa học tồn tại
                var course = await _context.Courses
                    .FirstOrDefaultAsync(c => c.Id == request.CourseId && c.IsActive);

                if (course == null)
                {
                    Console.WriteLine($"[PayOS] Course not found or inactive: {request.CourseId}");
                    return new CoursePaymentResponseDto
                    {
                        Success = false,
                        Message = "Khóa học không tồn tại hoặc không khả dụng"
                    };
                }

                Console.WriteLine($"[PayOS] Found course: {course.Title}, Price: {course.Price}");

                // Lấy Student từ Account
                var student = await _context.Students
                    .FirstOrDefaultAsync(s => s.AccountId == accountId);

                if (student == null)
                {
                    Console.WriteLine($"[PayOS] Student not found for AccountId: {accountId}");
                    return new CoursePaymentResponseDto
                    {
                        Success = false,
                        Message = "Không tìm thấy thông tin học viên"
                    };
                }

                Console.WriteLine($"[PayOS] Found student: {student.Id}");

                // Kiểm tra đã đăng ký chưa
                var existingEnrollment = await _context.Enrollments
                    .FirstOrDefaultAsync(e => e.StudentId == student.Id && e.CourseId == request.CourseId);

                if (existingEnrollment != null)
                {
                    Console.WriteLine($"[PayOS] Student already enrolled in course");
                    return new CoursePaymentResponseDto
                    {
                        Success = false,
                        Message = "Bạn đã đăng ký khóa học này rồi"
                    };
                }

                // Tạo orderCode
                long timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                int accountHash = Math.Abs(accountId.GetHashCode()) % 100000;
                long orderCode = accountHash * 10000000L + timestamp % 10000000L;

                Console.WriteLine($"[PayOS] Generated orderCode: {orderCode}");

                // Tạo Transaction (không tạo TransactionDetail để tránh lỗi cascade)
                // Lưu CourseId vào Description để tra cứu sau
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
                Console.WriteLine($"[PayOS] Saved transaction to database");

                // Gửi request tới PayOS
                var baseUrl = _config["BackendUrl"] ?? "http://localhost:5120";
                var frontendUrl = _config["FrontendUrl"] ?? "http://localhost:5173";
                var body = new
                {
                    orderCode,
                    amount = (int)course.Price,
                    description = "",
                    cancelUrl = $"{frontendUrl}/payment/result?status=cancel&orderCode={orderCode}",
                    returnUrl = $"{frontendUrl}/payment/result?status=success&orderCode={orderCode}"
                };

                Console.WriteLine($"[PayOS] Calling PayOS API with amount: {body.amount}");

                string raw = $"amount={body.amount}&cancelUrl={body.cancelUrl}&description={body.description}&orderCode={body.orderCode}&returnUrl={body.returnUrl}";
                string signature = ComputeSignature(raw, _checksumKey);

                var payload = new
                {
                    body.orderCode,
                    body.amount,
                    body.description,
                    body.cancelUrl,
                    body.returnUrl,
                    signature
                };

                var response = await _httpClient.PostAsync(
                    "https://api-merchant.payos.vn/v2/payment-requests",
                    new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
                );

                var responseText = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[PayOS] PayOS Response Status: {response.StatusCode}");
                Console.WriteLine($"[PayOS] PayOS Response Body: {responseText}");
                Console.WriteLine($"[PayOS] Request Payload: {JsonSerializer.Serialize(payload)}");

                // PayOS có thể trả về status 200 nhưng có code lỗi trong body
                var payosResponse = JsonSerializer.Deserialize<JsonElement>(responseText);

                // Check nếu có code lỗi
                if (payosResponse.TryGetProperty("code", out var code))
                {
                    var codeValue = code.GetString();
                    Console.WriteLine($"[PayOS] Response code: {codeValue}");

                    if (codeValue != "00")
                    {
                        var desc = payosResponse.TryGetProperty("desc", out var descProp)
                            ? descProp.GetString()
                            : "Unknown error";

                        Console.WriteLine($"[PayOS] PayOS returned error code: {codeValue}, desc: {desc}");
                        _context.Transactions.Remove(transaction);
                        await _context.SaveChangesAsync();

                        return new CoursePaymentResponseDto
                        {
                            Success = false,
                            Message = $"Lỗi PayOS: {desc}"
                        };
                    }
                }

                // Check checkoutUrl
                if (payosResponse.TryGetProperty("data", out var data) &&
                    data.TryGetProperty("checkoutUrl", out var checkoutUrl))
                {
                    Console.WriteLine($"[PayOS] Success - CheckoutUrl: {checkoutUrl.GetString()}");
                    return new CoursePaymentResponseDto
                    {
                        Success = true,
                        CheckoutUrl = checkoutUrl.GetString(),
                        OrderCode = orderCode.ToString(),
                        Message = "Tạo thanh toán thành công"
                    };
                }

                // Nếu không có checkoutUrl
                Console.WriteLine($"[PayOS] Response doesn't contain checkoutUrl");
                _context.Transactions.Remove(transaction);
                await _context.SaveChangesAsync();

                return new CoursePaymentResponseDto
                {
                    Success = false,
                    Message = $"Không thể lấy link thanh toán. Response: {responseText}"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PayOS] ERROR: {ex.Message}");
                Console.WriteLine($"[PayOS] Stack trace: {ex.StackTrace}");
                return new CoursePaymentResponseDto
                {
                    Success = false,
                    Message = $"Lỗi: {ex.Message}"
                };
            }
        }

        public async Task<bool> VerifyPaymentAndEnrollAsync(string orderCode)
        {
            try
            {
                Console.WriteLine($"[PayOS] Start VerifyPayment - OrderCode: {orderCode}");

                // Tìm transaction theo orderCode trong Description
                var transaction = await _context.Transactions
                    .FirstOrDefaultAsync(t => t.Description != null && t.Description.Contains($"OrderCode:{orderCode}"));

                if (transaction == null)
                {
                    Console.WriteLine($"[PayOS] Transaction not found for OrderCode: {orderCode}");
                    return false;
                }

                Console.WriteLine($"[PayOS] Found transaction: {transaction.Id}, Status: {transaction.Status}");

                // Nếu đã xử lý rồi thì return true luôn
                if (transaction.Status == "Success")
                {
                    Console.WriteLine($"[PayOS] Transaction already processed");
                    return true;
                }

                // Verify với PayOS API
                var response = await _httpClient.GetAsync($"https://api-merchant.payos.vn/v2/payment-requests/{orderCode}");
                var responseText = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"[PayOS] PayOS Verify Response: {responseText}");

                var payosResponse = JsonSerializer.Deserialize<JsonElement>(responseText);

                if (payosResponse.TryGetProperty("data", out var data) &&
                    data.TryGetProperty("status", out var status) &&
                    status.GetString() == "PAID")
                {
                    Console.WriteLine($"[PayOS] Payment verified as PAID");

                    // Update transaction status
                    transaction.Status = "Success";

                    // Lấy Student từ Account
                    var student = await _context.Students
                        .FirstOrDefaultAsync(s => s.AccountId == transaction.AccountId);

                    if (student == null)
                    {
                        Console.WriteLine($"[PayOS] Student not found for AccountId: {transaction.AccountId}");
                        return false;
                    }

                    // Parse CourseId từ Description
                    var descParts = transaction.Description?.Split('|') ?? Array.Empty<string>();
                    var courseIdPart = descParts.FirstOrDefault(p => p.StartsWith("CourseId:"));
                    if (courseIdPart != null && Guid.TryParse(courseIdPart.Replace("CourseId:", ""), out var courseId))
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
                            Console.WriteLine($"[PayOS] Created enrollment for course: {courseId}");

                            // Tăng enrollment count của course
                            var course = await _context.Courses.FindAsync(courseId);
                            if (course != null)
                            {
                                course.EnrollmentCount++;
                            }
                        }
                    }

                    await _context.SaveChangesAsync();
                    Console.WriteLine($"[PayOS] Payment verification completed successfully");
                    return true;
                }

                Console.WriteLine($"[PayOS] Payment not verified - status is not PAID");
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PayOS] ERROR in VerifyPaymentAndEnrollAsync: {ex.Message}");
                Console.WriteLine($"[PayOS] Stack trace: {ex.StackTrace}");
                return false;
            }
        }

        public async Task<bool> ProcessPaymentWebhookAsync(JsonElement payload)
        {
            try
            {
                var dataRaw = payload.GetProperty("data").ToString();
                var signature = payload.GetProperty("signature").GetString();
                string computedSig = ComputeSignature(dataRaw, _checksumKey);

                if (computedSig != signature)
                    return false;

                var data = JsonDocument.Parse(dataRaw).RootElement;
                var orderCode = data.GetProperty("orderCode").GetString();

                if (string.IsNullOrEmpty(orderCode))
                    return false;

                return await VerifyPaymentAndEnrollAsync(orderCode);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in ProcessPaymentWebhookAsync: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> CancelPaymentAsync(string orderCode)
        {
            try
            {
                Console.WriteLine($"[PayOS] Cancelling payment - OrderCode: {orderCode}");

                // Tìm transaction
                var transaction = await _context.Transactions
                    .FirstOrDefaultAsync(t => t.Description != null && t.Description.Contains($"OrderCode:{orderCode}"));

                if (transaction == null)
                {
                    Console.WriteLine($"[PayOS] Transaction not found for OrderCode: {orderCode}");
                    return false;
                }

                // Chỉ cancel nếu đang pending
                if (transaction.Status == "Pending")
                {
                    transaction.Status = "Failed";
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"[PayOS] Payment cancelled successfully");
                    return true;
                }

                Console.WriteLine($"[PayOS] Cannot cancel - Transaction status: {transaction.Status}");
                return false;
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

            var enrollments = await _context.Enrollments
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

            return enrollments;
        }

        private string ComputeSignature(string raw, string key)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
            return BitConverter.ToString(hmac.ComputeHash(Encoding.UTF8.GetBytes(raw)))
                .Replace("-", "").ToLower();
        }
    }
}
