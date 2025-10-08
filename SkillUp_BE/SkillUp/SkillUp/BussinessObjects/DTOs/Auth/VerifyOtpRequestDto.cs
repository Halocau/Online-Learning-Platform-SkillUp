using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Auth
{
    public class VerifyOtpRequestDto
    {
        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Mã OTP là bắt buộc")]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "Mã OTP phải có 6 số")]
        public string OtpCode { get; set; } = null!;
    }
}
