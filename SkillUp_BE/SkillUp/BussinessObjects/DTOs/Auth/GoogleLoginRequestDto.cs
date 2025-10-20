using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Auth
{
    public class GoogleLoginRequestDto
    {

        [Required(ErrorMessage = "IdToken là bắt buộc")]
        public string IdToken { get; set; } = string.Empty;

        public int DefaultRoleId { get; set; } = 1;
    }
}
