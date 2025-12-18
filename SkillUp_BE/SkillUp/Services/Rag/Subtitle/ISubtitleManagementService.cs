using SkillUp.BussinessObjects.DTOs.Subtitle;

namespace SkillUp.Services.Rag.Subtitle
{
    public interface ISubtitleManagementService
    {
        /// <summary>
        /// Lấy Subtitle text từ Asset của lesson (cho giáo viên xem/sửa)
        /// </summary>
        Task<SubtitleDto?> GetLessonSubtitleAsync(Guid lessonId, CancellationToken ct = default);

        /// <summary>
        /// Cập nhật Subtitle text và Re-Index vào Qdrant (khi giáo viên sửa)
        /// </summary>
        Task<SubtitleUpdateResult> UpdateLessonSubtitleAsync(
            Guid lessonId,
            string subtitleText,
            CancellationToken ct = default);
    }
}

