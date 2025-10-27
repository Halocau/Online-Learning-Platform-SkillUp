using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ILecturerApplicationRepository
    {
        Task<List<LecturerApplication>> GetAllLecturerApplicationsAsync();
        Task<LecturerApplication> UpdateStatusAsync(Guid applicationId, bool status, string reason);
        Task<LecturerApplication> GetByIdAsync(Guid id);
        Task<LecturerApplication> GetByAccountIdAsync(Guid accountId);
        Task<LecturerApplication> GetLatestByAccountIdAsync(Guid accountId);
        Task<List<LecturerApplication>> GetAllByAccountIdAsync(Guid accountId);
        Task<List<LecturerApplication>> GetAllAsync();
        Task<List<LecturerApplication>> GetByStatusAsync(string status);
        Task<LecturerApplication> AddAsync(LecturerApplication application);
        Task<LecturerApplication> UpdateAsync(LecturerApplication application);
        Task<bool> SaveChangesAsync();
        Task<bool> DeleteAsync(Guid id);
        Task<bool> ExistsByAccountIdAsync(Guid accountId);
    }
}