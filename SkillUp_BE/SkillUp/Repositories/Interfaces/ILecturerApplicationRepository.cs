using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ILecturerApplicationRepository
    {
        Task<LecturerApplication> GetByIdAsync(Guid id);
        Task<LecturerApplication> GetByAccountIdAsync(Guid accountId);
        Task<List<LecturerApplication>> GetAllAsync();
        Task<List<LecturerApplication>> GetByStatusAsync(string status);
        Task<LecturerApplication> AddAsync(LecturerApplication application);
        Task<LecturerApplication> UpdateAsync(LecturerApplication application);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> ExistsByAccountIdAsync(Guid accountId);
    }
}