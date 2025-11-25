using SkillUp.BussinessObjects.DTOs.Subtitle;

namespace SkillUp.Services.Rag.Subtitle
{
    public interface ISubtitleService
    {
        /// <summary>
        /// Chunk subtitle text, embed, and store into vector DB for a lesson.
        /// </summary>
        Task<SubtitleIndexResult> IndexLessonAsync(SubtitleIndexRequest request, CancellationToken ct = default);
    }
}

