using SkillUp.BussinessObjects.DTOs.LecturerApplication;
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
    public interface ILecturerApplicationService
    {
        /// <summary>
        /// Apply CV for lecturer position (first time or reapply)
        /// </summary>
        Task<bool> ApplyCvAsync(Guid accountId, ApplyCvRequestDto request);

        /// <summary>
        /// Get all applications of a user
        /// </summary>
        Task<List<LecturerApplicationResponseDto>> GetMyApplicationsAsync(Guid accountId);

        /// <summary>
        /// Update existing application (only if status is Pending or Rejected)
        /// </summary>
        Task<bool> UpdateApplicationAsync(Guid accountId, Guid applicationId, UpdateCvRequestDto request);

        /// <summary>
        /// Get application by ID
        /// </summary>
        Task<LecturerApplicationResponseDto?> GetApplicationByIdAsync(Guid applicationId);
    }
}
