using CloudinaryDotNet;
using SkillUp.BussinessObjects.DTOs.User;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly IAccountRepository _accountRepository;
        private readonly CloudinaryService _cloudinaryService;
        public UserService(IAccountRepository accountRepository, CloudinaryService cloudinaryService)
        {
            _accountRepository = accountRepository;
            _cloudinaryService = cloudinaryService;
        }
        public async Task<UserProfileDTO?> GetMyProfileAsync(Guid userId)
        {
            var user = await _accountRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return null;
            }
            var userProfileDTO = new UserProfileDTO()
            {
                Id = user.Id,
                Email = user.Email,
                Fullname = user.Fullname,
                Phone = user.Phone,
                Gender = user.Gender,
                Dob = user.Dob,
                Avatar = user.Avatar,
                Role = user.Role?.Name ?? "Unknown",
                Description = user.Description,
                CreatedAt = user.CreatedAt
            };
            return userProfileDTO;
        }

        public async Task<string?> UpdateAvatarAsync(Guid userId, IFormFile avatar)
        {
            if (avatar == null || avatar.Length == 0)
            {
                return null;
            }
            const long maxFileSize = 5 * 1024 * 1024;
            if (avatar.Length > maxFileSize)
            {
                return null;
            }
            var allowedContentTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowedContentTypes.Contains(avatar.ContentType.ToLower()))
            {

                return null;
            }
            var account = await _accountRepository.GetByIdAsync(userId);
            if (account == null)
            {
                return null;
            }


            string newAvatarUrl;
            try
            {

                newAvatarUrl = await _cloudinaryService.UploadImageAsync(avatar, "skillup/avatars");
            }
            catch (Exception)
            {
                return null;
            }

            if (string.IsNullOrEmpty(newAvatarUrl))
            {
                return null;
            }


            account.Avatar = newAvatarUrl;
            await _accountRepository.UpdateAsync(account);
            await _accountRepository.SaveChangesAsync();


            return newAvatarUrl;
            
        }

        public async Task<bool> UpdateProfileAsync(Guid userId, UpdateProfileDTO updateProfileDTO)
        {
            var user = await _accountRepository.GetByIdAsync(userId);

            if (user == null)
            {
                return false;
            }
            user.Fullname = updateProfileDTO.Fullname ?? user.Fullname;
            user.Phone = updateProfileDTO.Phone ?? user.Phone;
            user.Gender = updateProfileDTO.Gender ?? user.Gender;
            user.Description = updateProfileDTO.Description ?? user.Description;
            if (updateProfileDTO.Dob.HasValue)
            {
                user.Dob = updateProfileDTO.Dob.Value;
            }
            await _accountRepository.UpdateAsync(user);
            return await _accountRepository.SaveChangesAsync();
        }
    }
}
