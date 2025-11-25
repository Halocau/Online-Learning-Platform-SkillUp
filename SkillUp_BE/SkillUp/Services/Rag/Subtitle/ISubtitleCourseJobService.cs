using SkillUp.BussinessObjects.DTOs.Subtitle;

namespace SkillUp.Services.Rag.Subtitle
{
    public interface ISubtitleCourseJobService
    {
        Task<SubtitleCourseJobResult> GenerateForCourseAsync(
           Guid courseId,
           bool force = false,
           CancellationToken ct = default);
    }
}
