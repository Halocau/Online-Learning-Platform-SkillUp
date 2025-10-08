using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid? UserId
        {
            get
            {
                var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("userId");
                if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
                {
                    return userId;
                }
                return null;
            }
        }

        public string? Email => _httpContextAccessor.HttpContext?.User?.FindFirst("email")?.Value;

        public string? Fullname => _httpContextAccessor.HttpContext?.User?.FindFirst("fullname")?.Value;

        public List<string> Permissions
        {
            get
            {
                var claims = _httpContextAccessor.HttpContext?.User?.FindAll("permission");
                return claims?.Select(c => c.Value).ToList() ?? new List<string>();
            }
        }
    }
}
