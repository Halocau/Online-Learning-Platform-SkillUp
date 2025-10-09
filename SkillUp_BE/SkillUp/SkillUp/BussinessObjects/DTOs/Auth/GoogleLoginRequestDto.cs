using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Auth
{
    public class GoogleLoginRequestDto
    {
        /// <summary>
        /// Google ID Token (JWT) nhận từ Google Sign-In ở frontend
        /// </summary>
        [Required(ErrorMessage = "IdToken là bắt buộc")]
        public string IdToken { get; set; } = string.Empty;

        /// <summary>
        /// RoleId mặc định khi đăng ký mới qua Google (1 = Student)
        /// </summary>
        public int DefaultRoleId { get; set; } = 1;
    }
}
