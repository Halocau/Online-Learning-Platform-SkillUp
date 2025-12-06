using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface IRatingRepository
    {
        Task<Rating> CreateAsync(Rating rating);
        Task<Rating?> GetByIdAsync(int id);
        Task UpdateAsync(Rating rating);
        Task DeleteAsync(Rating rating);
        Task<Rating?> GetByStudentAndCourseAsync(Guid studentId, Guid courseId);
        Task<IEnumerable<Rating>> GetRatingsByCourseIdAsync(Guid courseId);
        Task<IEnumerable<Rating>> GetRatingsByStudentIdAsync(Guid studentId, Guid? courseId = null);
        Task<double?> CalculateAverageRatingAsync(Guid courseId);
    }
}