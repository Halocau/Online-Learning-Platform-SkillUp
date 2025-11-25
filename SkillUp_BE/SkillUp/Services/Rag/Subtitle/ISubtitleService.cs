using SkillUp.BussinessObjects.DTOs.Subtitle;

namespace SkillUp.Services.Rag.Subtitle
{
    public interface ISubtitleService
    {
        /// <summary>
        /// Chunk subtitle text, embed, and store into vector DB for a lesson.
        /// </summary>
        Task<SubtitleIndexResult> IndexLessonAsync(SubtitleIndexRequest request, CancellationToken ct = default);

        /// <summary>
        /// Check if lesson already has indexed subtitle chunks.
        /// </summary>
        Task<bool> LessonHasIndexedSubtitleAsync(Guid lessonId, CancellationToken ct = default);

        /// <summary>
        /// Check if a lesson has any subtitles indexed.
        /// </summary>
        Task<bool> HasSubtitlesAsync(Guid lessonId, CancellationToken ct = default);
    }
}

