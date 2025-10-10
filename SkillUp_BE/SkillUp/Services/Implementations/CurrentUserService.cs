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

        public int? RoleId
        {
            get
            {
                var roleIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst("roleId");
                if (roleIdClaim != null && int.TryParse(roleIdClaim.Value, out var roleId))
                {
                    return roleId;
                }
                return null;
            }
        }

        public string? RoleName => _httpContextAccessor.HttpContext?.User?.FindFirst("roleName")?.Value;

        public List<string> Permissions
        {
            get
            {
                var claims = _httpContextAccessor.HttpContext?.User?.FindAll("permission");
                return claims?.Select(c => c.Value).ToList() ?? new List<string>();
            }
        }

        public List<string> PermissionCodes
        {
            get
            {
                var claims = _httpContextAccessor.HttpContext?.User?.FindAll("permissionCode");
                return claims?.Select(c => c.Value).ToList() ?? new List<string>();
            }
        }

        public List<int> PermissionIds
        {
            get
            {
                var claims = _httpContextAccessor.HttpContext?.User?.FindAll("permissionId");
                var ids = new List<int>();

                if (claims != null)
                {
                    foreach (var claim in claims)
                    {
                        if (int.TryParse(claim.Value, out var permissionId))
                        {
                            ids.Add(permissionId);
                        }
                    }
                }

                return ids;
            }
        }

        public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

        public bool HasPermission(string permissionName)
        {
            return Permissions.Any(p => p.Equals(permissionName, StringComparison.OrdinalIgnoreCase));
        }

        public bool HasPermissionCode(string permissionCode)
        {
            return PermissionCodes.Any(p => p.Equals(permissionCode, StringComparison.OrdinalIgnoreCase));
        }
    }
}
