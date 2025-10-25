using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ILecturerRepository
    {
        Task<Lecturer?> GetLecturerByAccountIdAsync(Guid accountId);
    }
}
