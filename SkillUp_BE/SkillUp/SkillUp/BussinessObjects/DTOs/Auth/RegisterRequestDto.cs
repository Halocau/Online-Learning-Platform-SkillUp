using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Auth
{
    public class RegisterRequestDto
    {
        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự")]
        public string Password { get; set; } = null!;

        [Required(ErrorMessage = "Xác nhận mật khẩu là bắt buộc")]
        [Compare("Password", ErrorMessage = "Mật khẩu xác nhận không khớp")]
        public string ConfirmPassword { get; set; } = null!;

        [Required(ErrorMessage = "Họ tên là bắt buộc")]
        public string Fullname { get; set; } = null!;

        public string? Phone { get; set; }

        public string? Gender { get; set; }

        public DateOnly? Dob { get; set; }
    }
}