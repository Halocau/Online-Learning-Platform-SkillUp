using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ICourseRepository
    {
        Task AddCourseAsync(Course course);
        Task<bool> SaveChangesAsync();
    }
}
