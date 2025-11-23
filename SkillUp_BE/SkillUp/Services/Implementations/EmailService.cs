using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging; // 1. Thêm ILogger
using MimeKit;
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Implementations
{
	public class EmailService : Interfaces.IEmailService
	{
		private readonly string _frontendUrl;
		private readonly string _backendUrl;
		private readonly string _fromEmail;
		private readonly string _smtpServer;
		private readonly int _smtpPort;
		private readonly string _smtpPassword;
		private readonly ILogger<EmailService> _logger;

		// 3. Tiêm ILogger và load cấu hình MỘT LẦN trong constructor
		public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
		{
			_logger = logger;
			_frontendUrl = configuration["FrontendUrl"] ?? "http://localhost:5173";
			_backendUrl = configuration["BackendUrl"] ?? "http://localhost:5120";

			var emailSettings = configuration.GetSection("Email");
			_fromEmail = emailSettings["From"];
			_smtpServer = emailSettings["Smtp"];
			_smtpPort = int.Parse(emailSettings["Port"] ?? "587");
			_smtpPassword = emailSettings["Password"];

			// Fail-fast: Kiểm tra cấu hình thiết yếu khi khởi động
			if (string.IsNullOrEmpty(_fromEmail) || string.IsNullOrEmpty(_smtpServer) || string.IsNullOrEmpty(_smtpPassword))
			{
				_logger.LogCritical("Email settings (From, Smtp, Password) are not configured properly.");
				throw new InvalidOperationException("Email settings are not configured.");
			}
		}

		// 4. Phương thức private CORE để gửi TẤT CẢ email
		private async Task<bool> SendEmailCoreAsync(MimeMessage message)
		{
			try
			{
				using (var client = new SmtpClient())
				{
					await client.ConnectAsync(_smtpServer, _smtpPort, SecureSocketOptions.StartTls);
					await client.AuthenticateAsync(_fromEmail, _smtpPassword);
					await client.SendAsync(message);
					await client.DisconnectAsync(true);
				}
				return true;
			}
			catch (Exception ex)
			{
				// 5. Log lỗi chi tiết!
				_logger.LogError(ex, "Failed to send email to {ToAddresses}", string.Join(", ", message.To));
				return false;
			}
		}

		// 6. Các phương thức public giờ chỉ việc xây dựng MimeMessage
		public async Task<bool> SendOtpEmailAsync(string toEmail, string otpCode, string fullname)
		{
			var message = new MimeMessage();
			message.From.Add(new MailboxAddress("SkillUp Platform", _fromEmail));
			message.To.Add(new MailboxAddress(fullname, toEmail));
			message.Subject = "Xác thực tài khoản SkillUp - Mã OTP của bạn";

			var bodyBuilder = new BodyBuilder
			{
				HtmlBody = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>
                        <h2 style='color: #4CAF50; text-align: center;'>SkillUp</h2>
                        <h3>Xin chào {fullname},</h3>
                        <p>Cảm ơn bạn đã đăng ký tài khoản tại SkillUp. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã OTP bên dưới:</p>
                        
                        <div style='background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;'>
                            <h1 style='color: #4CAF50; font-size: 36px; margin: 0; letter-spacing: 5px;'>{otpCode}</h1>
                        </div>
                        
                        <p><strong>Lưu ý:</strong></p>
                        <ul>
                            <li>Mã OTP này có hiệu lực trong <strong>5 phút</strong></li>
                            <li>Không chia sẻ mã này với bất kỳ ai</li>
                            <li>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email</li>
                        </ul>
                        
                        <p style='margin-top: 30px; color: #666; font-size: 12px; text-align: center;'>
                            Email này được gửi tự động, vui lòng không trả lời.<br>
                            © 2025 SkillUp Platform. All rights reserved.
                        </p>
                    </div>
                </body>
                </html>"
			};
			message.Body = bodyBuilder.ToMessageBody();

			return await SendEmailCoreAsync(message);
		}

		public async Task<bool> SendLecturerApplicationStatusEmailAsync(Account account, bool isApproved, string reason)
		{
			string htmlBody;
			string subject;

			// --- Biến CSS chung để dễ quản lý ---
			// (Lấy từ _frontendUrl và config sẽ tốt hơn, nhưng tạm hard-code)
			string fontFamily = "Arial, 'Helvetica Neue', Helvetica, sans-serif";
			string brandColor = "#4CAF50";
			string brandColorRejected = "#e74c3c";
			string bgColor = "#f4f7f6";
			string cardColor = "#ffffff";
			string textColor = "#555555";
			string lightTextColor = "#999999";
			string linkLogin = _frontendUrl + "/login"; // Sử dụng biến _frontendUrl đã có
			string emailContact = _fromEmail; // Sử dụng biến _fromEmail đã có

			if (isApproved)
			{
				// === EMAIL CHẤP THUẬN ===
				subject = "Chúc mừng! Bạn đã trở thành Giảng viên SkillUp";
				htmlBody = $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{subject}</title>
</head>
<body style='margin: 0; padding: 0; background-color: {bgColor}; font-family: {fontFamily};'>
    <span style='display:none; font-size:1px; color:#ffffff; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;'>
        Chúc mừng {account.Fullname}! Đơn đăng ký giảng viên của bạn đã được chấp thuận.
    </span>
    <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color: {bgColor};'>
        <tr>
            <td align='center' style='padding: 20px;'>
                <table width='100%' border='0' cellspacing='0' cellpadding='0' style='max-width: 600px; background-color: {cardColor}; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);'>
                    <tr>
                        <td align='center' style='padding: 30px 20px; background-color: {brandColor};'>
                            <h1 style='color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;'>SkillUp</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding: 40px 30px 30px 30px; color: {textColor}; font-size: 16px; line-height: 1.7;'>
                            <h2 style='color: #333333; margin-top: 0; font-size: 24px;'>Xin chào {account.Fullname},</h2>
                            <p style='margin: 0 0 20px 0;'>Chúc mừng! Đơn đăng ký trở thành giảng viên của bạn tại SkillUp đã được <strong>chấp thuận</strong>.</p>
                            <p style='margin: 0 0 30px 0;'>Tài khoản của bạn đã được kích hoạt làm giảng viên. Bạn có thể bắt đầu tạo và quản lý các khóa học của mình ngay bây giờ. Hãy bắt đầu hành trình giảng dạy cùng SkillUp!</p>
                            <table border='0' cellspacing='0' cellpadding='0' width='100%'>
                                <tr>
                                    <td align='center'>
                                        <a href='{linkLogin}' target='_blank' style='background-color: {brandColor}; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;'>
                                            Đăng nhập ngay
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style='margin: 30px 0 0 0;'>Cảm ơn bạn đã tham gia cộng đồng SkillUp. Chúng tôi rất vui mừng chào đón bạn!</p>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding: 30px; background-color: #f9f9f9; border-top: 1px solid #eeeeee;'>
                            <p style='margin: 0; font-size: 13px; color: {lightTextColor}; text-align: center;'>
                                &copy; {DateTime.Now.Year} SkillUp. All rights reserved.<br>
                                Nếu bạn gặp bất kỳ vấn đề nào, vui lòng liên hệ <a href='mailto:{emailContact}' style='color: {brandColor}; text-decoration: none;'>{emailContact}</a>.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
			}
			else
			{
				// === EMAIL TỪ CHỐI ===
				subject = "Cập nhật đơn đăng ký giảng viên SkillUp";
				string reasonHtml = string.IsNullOrEmpty(reason)
					? ""
					: $@"<table width='100%' border='0' cellspacing='0' cellpadding='0' style='margin: 25px 0;'>
                     <tr>
                         <td style='background-color: #fef0f0; border: 1px solid #fde0e0; border-radius: 8px; padding: 20px; font-size: 15px; line-height: 1.6; color: #721c24;'>
                             <strong style='color: {brandColorRejected};'>Phản hồi từ đội ngũ xét duyệt:</strong><br>
                             {reason}
                         </td>
                     </tr>
                 </table>";

				htmlBody = $@"
<!DOCTYPE html>
<html lang='vi'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{subject}</title>
</head>
<body style='margin: 0; padding: 0; background-color: {bgColor}; font-family: {fontFamily};'>
    <span style='display:none; font-size:1px; color:#ffffff; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;'>
        Cập nhật về đơn đăng ký giảng viên của bạn tại SkillUp.
    </span>
    <table width='100%' border='0' cellspacing='0' cellpadding='0' style='background-color: {bgColor};'>
        <tr>
            <td align='center' style='padding: 20px;'>
                <table width='100%' border='0' cellspacing='0' cellpadding='0' style='max-width: 600px; background-color: {cardColor}; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);'>
                    <tr>
                        <td align='center' style='padding: 30px 20px; background-color: {brandColor};'>
                            <h1 style='color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;'>SkillUp</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding: 40px 30px 30px 30px; color: {textColor}; font-size: 16px; line-height: 1.7;'>
                            <h2 style='color: #333333; margin-top: 0; font-size: 24px;'>Xin chào {account.Fullname},</h2>
                            <p style='margin: 0 0 20px 0;'>Chúng tôi rất tiếc phải thông báo rằng đơn đăng ký trở thành giảng viên của bạn tại SkillUp đã <strong>bị từ chối</strong>.</p>
                            {reasonHtml}
                            <p style='margin: 0 0 30px 0;'>Bạn có thể vào hệ thống cập nhật lại thông tin và nộp đơn lại.</p>
                            <table border='0' cellspacing='0' cellpadding='0' width='100%'>
                                <tr>
                                    <td align='center'>
                                        <a href='{linkLogin}' target='_blank' style='background-color: {brandColor}; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;'>
                                            Xem lại thông tin
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style='margin: 30px 0 0 0;'>Cảm ơn bạn đã quan tâm đến SkillUp. Hy vọng sẽ có cơ hội làm việc cùng bạn trong tương lai!</p>
                        </td>
                    </tr>
                    <tr>
                        <td style='padding: 30px; background-color: #f9f9f9; border-top: 1px solid #eeeeee;'>
                            <p style='margin: 0; font-size: 13px; color: {lightTextColor}; text-align: center;'>
                                &copy; {DateTime.Now.Year} SkillUp. All rights reserved.<br>
                                Nếu bạn cần hỗ trợ thêm, vui lòng liên hệ <a href='mailto:{emailContact}' style='color: {brandColor}; text-decoration: none;'>{emailContact}</a>.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>";
			}

			// Xây dựng MimeMessage
			var message = new MimeMessage();
			message.From.Add(new MailboxAddress("SkillUp Platform", _fromEmail));
			message.To.Add(new MailboxAddress(account.Fullname, account.Email));
			message.Subject = subject; // Subject đã được set ở trên
			message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

			// Gọi hàm core để gửi
			return await SendEmailCoreAsync(message);
		}
		public async Task<bool> SendVerifyEmailAsync(string toEmail, string verifyToken, string fullname)
		{
			// 7. Sử dụng _backendUrl từ cấu hình
			var verifyLink = $"{_backendUrl}/api/auth/verify-email?email={Uri.EscapeDataString(toEmail)}&token={Uri.EscapeDataString(verifyToken)}";

			var message = new MimeMessage();
			message.From.Add(new MailboxAddress("SkillUp Platform", _fromEmail));
			message.To.Add(new MailboxAddress(fullname, toEmail));
			message.Subject = "Xác thực tài khoản SkillUp - Click để kích hoạt";

			var bodyBuilder = new BodyBuilder
			{
				HtmlBody = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>
                        <h2 style='color: #4CAF50; text-align: center;'>SkillUp Platform</h2>
                        <h3>Xin chào {fullname},</h3>
                        <p>Cảm ơn bạn đã đăng ký tài khoản tại SkillUp. Để hoàn tất quá trình đăng ký, vui lòng click vào nút bên dưới:</p>
                        
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{verifyLink}' style='background-color: #4CAF50; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;'>
                                Xác thực tài khoản
                            </a>
                        </div>
                        
                        <p>Hoặc copy link này vào trình duyệt:</p>
                        <p style='background-color: #f4f4f4; padding: 10px; word-break: break-all; font-size: 12px;'>{verifyLink}</p>
                        
                        <p><strong>Lưu ý:</strong></p>
                        <ul>
                            <li>Link này có hiệu lực trong <strong>24 giờ</strong></li>
                            <li>Không chia sẻ link này với bất kỳ ai</li>
                            <li>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email</li>
                        </ul>
                        
                        <p style='margin-top: 30px; color: #666; font-size: 12px; text-align: center;'>
                            Email này được gửi tự động, vui lòng không trả lời.<br>
                            © 2025 SkillUp Platform. All rights reserved.
                        </p>
                    </div>
                </body>
                </html>"
			};
			message.Body = bodyBuilder.ToMessageBody();

			return await SendEmailCoreAsync(message);
		}

		public async Task<bool> SendResetPasswordEmailAsync(string toEmail, string resetToken, string fullname)
		{
			// Phương thức này đã dùng _frontendUrl (đúng)
			var resetPasswordLink = $"{_frontendUrl}/reset-password?email={Uri.EscapeDataString(toEmail)}&token={resetToken}";

			var message = new MimeMessage();
			message.From.Add(new MailboxAddress("SkillUp Platform", _fromEmail));
			message.To.Add(new MailboxAddress(fullname, toEmail));
			message.Subject = "Khôi phục mật khẩu SkillUp";

			var bodyBuilder = new BodyBuilder
			{
				HtmlBody = $@"
                <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>
                        <h2 style='color: #4CAF50; text-align: center;'>SkillUp</h2>
                        <h3>Xin chào {fullname},</h3>
                        <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Để đặt lại mật khẩu, vui lòng click vào nút bên dưới:</p>
                        
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{resetPasswordLink}' 
                               style='background-color: #4CAF50; 
                                     color: white; 
                                     padding: 12px 30px; 
                                     text-decoration: none; 
                                     border-radius: 5px;
                                     font-weight: bold;'>
                                Đặt lại mật khẩu
                            </a>
                        </div>
                        
                        <p><strong>Lưu ý:</strong></p>
                        <ul>
                            <li>Link này chỉ có hiệu lực trong <strong>1 giờ</strong></li>
                            <li>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này</li>
                            <li>Không chia sẻ link này với bất kỳ ai</li>
                        </ul>
                        
                        <hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;'>
                        <p style='text-align: center; color: #666; font-size: 14px;'>
                            Email này được gửi tự động. Vui lòng không trả lời.
                        </p>
                    </div>
                </body>
                </html>"
			};
			message.Body = bodyBuilder.ToMessageBody();

			return await SendEmailCoreAsync(message);
		}

		public async Task<bool> SendCoursePublishedEmailAsync(
	string toEmail,
	string fullname,
	string courseName,
	string courseId)
		{
			var courseLink = $"{_frontendUrl}/lecturer/courses";

			var message = new MimeMessage();
			message.From.Add(new MailboxAddress("SkillUp Platform", _fromEmail));
			message.To.Add(new MailboxAddress(fullname, toEmail));
			message.Subject = "Khoá học của bạn đã được xuất bản";

			var bodyBuilder = new BodyBuilder
			{
				HtmlBody = $@"
        <html>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>
                <h2 style='color: #4CAF50; text-align: center;'>SkillUp</h2>

                <h3>Xin chào {fullname},</h3>

                <p>Chúc mừng! Khoá học <strong>{courseName}</strong> của bạn đã được đội ngũ kiểm duyệt phê duyệt và chính thức xuất bản trên nền tảng.</p>

                <p>Bạn có thể xem khoá học tại liên kết bên dưới:</p>

                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{courseLink}'
                       style='background-color: #4CAF50;
                              color: white;
                              padding: 12px 30px;
                              text-decoration: none;
                              border-radius: 5px;
                              font-weight: bold;'>
                        Xem khóa học
                    </a>
                </div>

                <p>Chúc bạn thu hút được nhiều học viên và tiếp tục mang lại giá trị cho cộng đồng!</p>

                <hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;'>
                <p style='text-align: center; color: #666; font-size: 14px;'>
                    Email này được gửi tự động. Vui lòng không trả lời.
                </p>
            </div>
        </body>
        </html>"
			};

			message.Body = bodyBuilder.ToMessageBody();

			return await SendEmailCoreAsync(message);
		}

		public async Task<bool> SendCourseRejectedEmailAsync(
	string toEmail,
	string fullname,
	string courseName,
	string rejectReason,
	string courseId)
		{
			var editCourseLink = $"{_frontendUrl}/lecturer/courses/{courseId}";

			var message = new MimeMessage();
			message.From.Add(new MailboxAddress("SkillUp Platform", _fromEmail));
			message.To.Add(new MailboxAddress(fullname, toEmail));
			message.Subject = "Khoá học của bạn chưa được phê duyệt";

			var bodyBuilder = new BodyBuilder
			{
				HtmlBody = $@"
        <html>
        <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>
                <h2 style='color: #FF5252; text-align: center;'>SkillUp</h2>

                <h3>Xin chào {fullname},</h3>

                <p>Rất tiếc! Khoá học <strong>{courseName}</strong> chưa thể được phê duyệt do không đáp ứng một số tiêu chí kiểm duyệt của SkillUp.</p>

                <p><strong>Lý do từ chối:</strong></p>
                <p style='background: #f8f8f8; padding: 10px; border-left: 4px solid #FF5252;'>
                    {rejectReason}
                </p>

                <p>Bạn vui lòng chỉnh sửa khoá học theo góp ý trên và gửi yêu cầu duyệt lại bất kỳ lúc nào.</p>

                <div style='text-align: center; margin: 30px 0;'>
                    <a href='{editCourseLink}'
                       style='background-color: #FF5252;
                              color: white;
                              padding: 12px 30px;
                              text-decoration: none;
                              border-radius: 5px;
                              font-weight: bold;'>
                        Chỉnh sửa khoá học
                    </a>
                </div>

                <p>Nếu bạn cần thêm hỗ trợ, vui lòng liên hệ đội ngũ hỗ trợ giảng viên của SkillUp.</p>

                <hr style='border: none; border-top: 1px solid #ddd; margin: 20px 0;'>
                <p style='text-align: center; color: #666; font-size: 14px;'>
                    Email này được gửi tự động. Vui lòng không trả lời.
                </p>
            </div>
        </body>
        </html>"
			};

			message.Body = bodyBuilder.ToMessageBody();

			return await SendEmailCoreAsync(message);
		}
	}
}