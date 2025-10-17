using SkillUp.BussinessObjects.DTOs.User;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly IAccountRepository _accountRepository;
        public UserService (IAccountRepository accountRepository)
        {
            _accountRepository = accountRepository;
        }
        public async Task<UserProfileDTO?> GetMyProfileAsync(Guid userId)
        {
           var user = await _accountRepository.GetByIdAsync(userId);
            if (user == null) {
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
                Description = user.Description,
                CreatedAt = user.CreatedAt
            };
            return userProfileDTO;
        }
    }
}
