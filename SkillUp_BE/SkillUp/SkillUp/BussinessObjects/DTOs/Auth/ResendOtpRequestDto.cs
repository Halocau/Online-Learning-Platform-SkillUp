using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Auth
{
    public class ResendOtpRequestDto
    {
        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        public string Email { get; set; } = null!;
    }
}
