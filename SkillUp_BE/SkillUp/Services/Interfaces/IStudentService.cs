using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
    public interface IStudentService
    {
        Task<Student> GetStudentByAccountIdAsync(Guid accountId);
        Task<bool> RegisterStudentAsync(Guid accountId);
    }
}
