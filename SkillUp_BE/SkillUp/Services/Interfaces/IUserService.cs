using SkillUp.BussinessObjects.DTOs.User;

namespace SkillUp.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserProfileDTO?> GetMyProfileAsync(Guid userId);
        Task<bool> UpdateProfileAsync(Guid userId , UpdateProfileDTO updateProfileDTO);
    }
}
