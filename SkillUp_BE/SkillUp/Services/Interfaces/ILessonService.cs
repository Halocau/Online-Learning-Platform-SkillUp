using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
    public interface ILessonService
    {
        Task<IEnumerable<Lesson>> GetAllLessonsAsync();
        Task<Lesson> GetLessonByIdAsync(Guid id);
        Task<Lesson> CreateLessonAsync(Lesson lesson);
        Task<Lesson> UpdateLessonAsync(Lesson lesson);
        Task<bool> DeleteLessonAsync(Guid id);
        Task<IEnumerable<Lesson>> GetActiveLessonsAsync();
        //Task<Asset> AddAssetToLessonAsync(Guid lessonId, Asset asset);
    }
}
