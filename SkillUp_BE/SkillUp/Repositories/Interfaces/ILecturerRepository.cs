using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ILecturerRepository
    {
        Task<Lecturer> GetByAccountIdAsync(Guid accountId);
        Task<Lecturer> UpdateAsync(Lecturer lecturer);
        Task<bool> SaveChangesAsync();
        Task<Lecturer> AddAsync(Lecturer lecturer);
        Task<List<Lecturer>> GetAllLecturersAsync();
        Task<Lecturer?> GetLecturerByAccountIdAsync(Guid accountId);
        Task<Lecturer?> GetLecturerByIdAsync(Guid lecturerId);
    }
}
