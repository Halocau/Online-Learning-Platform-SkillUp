namespace SkillUp.BussinessObjects.DTOs.Auth
{
    /// <summary>
    /// DTO trả về khi đăng nhập thành công - chỉ tokens
    /// </summary>
    public class LoginResponseDto
    {
        public string AccessToken { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
        public DateTime AccessTokenExpires { get; set; }
        public DateTime RefreshTokenExpires { get; set; }
    }
}
