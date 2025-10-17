using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace SkillUp.Services.Implementations
{
    public class EmailService : Interfaces.IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<bool> SendOtpEmailAsync(string toEmail, string otpCode, string fullname)
        {
            try
            {
                var emailSettings = _configuration.GetSection("Email");
                var fromEmail = emailSettings["From"];
                var smtpServer = emailSettings["Smtp"];
                var smtpPort = int.Parse(emailSettings["Port"] ?? "587");
                var smtpPassword = emailSettings["Password"];

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("SkillUp", fromEmail));
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

                using (var client = new SmtpClient())
                {
                    await client.ConnectAsync(smtpServer, smtpPort, SecureSocketOptions.StartTls);
                    await client.AuthenticateAsync(fromEmail, smtpPassword);
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                }

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> SendVerifyEmailAsync(string toEmail, string verifyToken, string fullname)
        {
            try
            {
                var emailSettings = _configuration.GetSection("Email");
                var fromEmail = emailSettings["From"];
                var smtpServer = emailSettings["Smtp"];
                var smtpPort = int.Parse(emailSettings["Port"] ?? "587");
                var smtpPassword = emailSettings["Password"];

                // Generate verify link (Update this URL to your frontend URL)
                var verifyLink = $"http://localhost:5120/api/auth/verify-email?email={Uri.EscapeDataString(toEmail)}&token={Uri.EscapeDataString(verifyToken)}";

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("SkillUp Platform", fromEmail));
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

                using (var client = new SmtpClient())
                {
                    await client.ConnectAsync(smtpServer, smtpPort, SecureSocketOptions.StartTls);
                    await client.AuthenticateAsync(fromEmail, smtpPassword);
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                }

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
