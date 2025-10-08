namespace SkillUp.Services.Interfaces
{
    public interface ICurrentUserService
    {
        Guid? UserId { get; }
        string? Email { get; }
        string? Fullname { get; }
        List<string> Permissions { get; }
    }
}
