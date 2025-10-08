using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Auth
{
    /// <summary>
    /// DTO gửi lên khi đăng nhập
    /// </summary>
    public class LoginRequestDto
    {
        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
        public string Password { get; set; } = null!;
    }
}
