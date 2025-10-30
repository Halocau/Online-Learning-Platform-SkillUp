using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IStudentRepository
    {
        Task AddAsync(Student student); 
        Task<Student> GetByAccountIdAsync(Guid accountId); 
        Task<bool> SaveChangesAsync(); 
    }
}
