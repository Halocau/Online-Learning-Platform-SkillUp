namespace SkillUp.BussinessObjects.DTOs.Auth
{
    /// <summary>
    /// DTO chứa tokens - frontend sẽ decode JWT để lấy thông tin
    /// </summary>
    public class TokenDto
    {
        public string AccessToken { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
    }
}
