namespace SkillUp.BussinessObjects.DTOs.Auth
{
    public class GoogleLoginResponseDto
    {
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Fullname { get; set; } = string.Empty;
        public string? Avatar { get; set; }
        public bool IsNewUser { get; set; } // true = vừa đăng ký, false = đã có tài khoản
        public TokenDto Token { get; set; } = new TokenDto();
    }
}
