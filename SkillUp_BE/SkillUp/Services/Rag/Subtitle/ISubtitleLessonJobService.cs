using SkillUp.BussinessObjects.DTOs.Subtitle;

namespace SkillUp.Services.Rag.Subtitle
{
    public interface ISubtitleLessonJobService
    {
        Task<SubtitleGenerationJobResult> GenerateForLessonAsync(
            Guid lessonId,
            bool force = false,
            CancellationToken ct = default);
    }
}

