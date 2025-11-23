using SkillUp.BussinessObjects.DTOs.Lesson;

namespace SkillUp.Services.Interfaces
{
    public interface ILessonService
    {
        Task<IEnumerable<GetLessonResponseDto>> GetAllLessonsAsync();
        Task<IEnumerable<GetLessonActiveResponseDto>> GetActiveLessonsAsync();
        Task<IEnumerable<LessonResponseDto>> GetLessonsBySectionIdAsync(Guid sectionId);
        Task<LessonResponseDto?> GetLessonByIdAsync(Guid id);
        Task<LessonResponseDto> CreateLessonAsync(CreateLessonDto dto, Guid accountId);
        Task<LessonResponseDto> UpdateLessonAsync(Guid id, UpdateLessonDto dto, Guid accountId);
        Task<bool> DeleteLessonAsync(Guid id, Guid accountId);
        Task<bool> MarkLessonAsCompletedAsync(Guid lessonId, Guid accountId);
    }
}
