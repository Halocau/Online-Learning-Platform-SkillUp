using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ILessonRepository
    {
        Task<IEnumerable<Lesson>> GetAllLessonsAsync();
        Task<IEnumerable<Lesson>> GetActiveLessonsAsync();
        Task<Lesson> GetLessonByIdAsync(Guid id);
        Task<Lesson> CreateLessonAsync(Lesson lesson);
        Task<Lesson> UpdateLessonAsync(Lesson lesson);
        Task<bool> DeleteLessonAsync(Guid id);
    }
}
