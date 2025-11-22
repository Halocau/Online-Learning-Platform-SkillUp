using SkillUp.BussinessObjects.DTOs.User;

namespace SkillUp.Services.Interfaces
{
    public interface IUserService
    {
        Task<UserProfileDTO?> GetMyProfileAsync(Guid userId);
        Task<bool> UpdateProfileAsync(Guid userId , UpdateProfileDTO updateProfileDTO);
        Task<string?> UpdateAvatarAsync (Guid userId , IFormFile avatar);

        Task<List<UserSummaryDTO>> GetAllUsersAsync();

        Task<bool> ToggleStatusUser(Guid userId , string newStatus);

        Task<List<UserSummaryDTO>> GetAllModerators();

	}
}
