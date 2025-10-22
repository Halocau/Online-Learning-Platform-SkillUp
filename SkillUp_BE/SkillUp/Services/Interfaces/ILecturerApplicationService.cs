using SkillUp.BussinessObjects.DTOs.Auth;
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
    public interface ILecturerApplicationService
    {
        Task<LecturerApplication> ApplyCvAsync(ApplyCvRequestDto request, Guid accountId);
        Task<LecturerApplication> GetApplicationByAccountIdAsync(Guid accountId);
    }
}