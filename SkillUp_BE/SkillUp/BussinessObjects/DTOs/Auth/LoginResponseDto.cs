namespace SkillUp.BussinessObjects.DTOs.Auth
{

    public class LoginResponseDto
    {
        public string AccessToken { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
    }
}
