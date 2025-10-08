namespace SkillUp.BussinessObjects.DTOs.Auth
{
    /// <summary>
    /// DTO trả về khi làm mới token thành công
    /// </summary>
    public class RefreshTokenResponseDto
    {
        public TokenDto Tokens { get; set; } = null!;
    }
}
