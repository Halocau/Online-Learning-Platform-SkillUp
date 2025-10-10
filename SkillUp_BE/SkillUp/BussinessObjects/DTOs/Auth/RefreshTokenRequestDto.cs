using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Auth
{
    /// <summary>
    /// DTO gửi lên khi làm mới token
    /// </summary>
    public class RefreshTokenRequestDto
    {
        [Required(ErrorMessage = "Access Token là bắt buộc")]
        public string AccessToken { get; set; } = null!;

        [Required(ErrorMessage = "Refresh Token là bắt buộc")]
        public string RefreshToken { get; set; } = null!;
    }
}
