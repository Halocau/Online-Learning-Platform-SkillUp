namespace SkillUp.Services.Interfaces
{
    public interface ICurrentUserService
    {
        Guid? UserId { get; }
        string? Email { get; }
        string? Fullname { get; }
        int? RoleId { get; }//Lấy ID của role từ claim "roleId" trong JWT token
        List<string> Permissions { get; } // Lấy DANH SÁCH tên permissions từ claim "permission" trong JWT token→ ["View Course", "Enroll Course", "Create Course"]
        List<string> PermissionCodes { get; }
        List<int> PermissionIds { get; }
        bool IsAuthenticated { get; }
        bool HasPermission(string permissionName);
        bool HasPermissionCode(string permissionCode);
    }
}
