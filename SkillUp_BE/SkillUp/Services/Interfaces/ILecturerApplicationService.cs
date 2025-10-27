using SkillUp.BussinessObjects.DTOs.LecturerApplication;
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
    public interface ILecturerApplicationService
    {
        Task<bool> ApplyCvAsync(Guid accountId, ApplyCvRequestDto request);
        Task<List<LecturerApplicationResponseDto>> GetMyApplicationsAsync(Guid accountId);
  
        Task<bool> UpdateApplicationAsync(Guid accountId, Guid applicationId, UpdateCvRequestDto request);
        Task<LecturerApplicationResponseDto?> GetApplicationByIdAsync(Guid applicationId);
        Task<bool> UpdateStatusAsync(Guid applicationId, UpdateStatusRequestDto request);
        Task<List<LecturerApplicationResponseDto>> GetAllLecturerApplicationsAsync();
    }
}
