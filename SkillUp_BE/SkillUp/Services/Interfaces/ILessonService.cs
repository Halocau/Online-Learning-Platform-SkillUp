using SkillUp.BussinessObjects.DTOs.Lesson;

namespace SkillUp.Services.Interfaces
{
    public interface ILessonService
    {
        Task<IEnumerable<LessonResponseDto>> GetAllLessonsAsync();
        Task<IEnumerable<LessonResponseDto>> GetActiveLessonsAsync();
        Task<IEnumerable<LessonResponseDto>> GetLessonsBySectionIdAsync(Guid sectionId);
        Task<LessonResponseDto?> GetLessonByIdAsync(Guid id);
        Task<LessonResponseDto> CreateLessonAsync(CreateLessonDto dto, Guid accountId);
        Task<LessonResponseDto> UpdateLessonAsync(Guid id, UpdateLessonDto dto, Guid accountId);
        Task<bool> DeleteLessonAsync(Guid id, Guid accountId);
    }
}
