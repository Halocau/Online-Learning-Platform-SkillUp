using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ILessonRepository
    {
        Task<IEnumerable<Lesson>> GetAllLessonsAsync();
        Task<IEnumerable<Lesson>> GetActiveLessonsAsync();
        Task<Lesson?> GetLessonByIdAsync(Guid id);
        Task<Lesson?> GetByIdAsync(Guid id);
        Task<Lesson?> GetLessonWithDetailsAsync(Guid id);
        Task<IEnumerable<Lesson>> GetLessonsBySectionIdAsync(Guid sectionId);
        Task AddLessonAsync(Lesson lesson);
        void UpdateLesson(Lesson lesson);
        Task<bool> SaveChangesAsync();
        Task<bool> DeleteLessonAsync(Guid id);

		Task<List<Lesson>> GetLessonsByIdsAndSectionAsync(IEnumerable<Guid> ids, Guid sectionId);
	}
}
