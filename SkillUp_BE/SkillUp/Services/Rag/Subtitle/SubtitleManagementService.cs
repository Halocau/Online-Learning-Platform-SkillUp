using Microsoft.Extensions.Logging;
using SkillUp.BussinessObjects.DTOs.Subtitle;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;

namespace SkillUp.Services.Rag.Subtitle
{
    public class SubtitleManagementService : ISubtitleManagementService
    {
        private readonly ILessonRepository _lessonRepository;
        private readonly ISubtitleService _subtitleService;
        private readonly IQdrantService _qdrantService;
        private readonly ILogger<SubtitleManagementService> _logger;

        public SubtitleManagementService(
            ILessonRepository lessonRepository,
            ISubtitleService subtitleService,
            IQdrantService qdrantService,
            ILogger<SubtitleManagementService> logger)
        {
            _lessonRepository = lessonRepository;
            _subtitleService = subtitleService;
            _qdrantService = qdrantService;
            _logger = logger;
        }

        public async Task<SubtitleDto?> GetLessonSubtitleAsync(Guid lessonId, CancellationToken ct = default)
        {
            var lesson = await _lessonRepository.GetLessonWithDetailsAsync(lessonId);
            if (lesson == null)
            {
                _logger.LogWarning("Lesson {LessonId} not found when getting subtitle", lessonId);
                return null;
            }

            var videoAsset = lesson.Assets?.FirstOrDefault(a => a.IsActive && !string.IsNullOrWhiteSpace(a.Url));
            if (videoAsset == null)
            {
                _logger.LogWarning("Lesson {LessonId} does not have an active video asset", lessonId);
                return null;
            }

            return new SubtitleDto
            {
                LessonId = lesson.Id,
                LessonTitle = lesson.Title,
                SubtitleText = videoAsset.SubtitleText ?? string.Empty,
                IsConfirmed = videoAsset.IsSubtitleConfirmed ?? false,
                VideoUrl = videoAsset.Url
            };
        }

        public async Task<SubtitleUpdateResult> UpdateLessonSubtitleAsync(
            Guid lessonId,
            string subtitleText,
            CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(subtitleText))
            {
                return new SubtitleUpdateResult
                {
                    Success = false,
                    Message = "Subtitle text không được để trống."
                };
            }

            var lesson = await _lessonRepository.GetLessonWithDetailsAsync(lessonId);
            if (lesson == null)
            {
                _logger.LogWarning("Lesson {LessonId} not found when updating subtitle", lessonId);
                return new SubtitleUpdateResult
                {
                    Success = false,
                    Message = "Lesson không tồn tại."
                };
            }

            var courseId = lesson.Section?.CourseId ?? Guid.Empty;
            var videoAsset = lesson.Assets?.FirstOrDefault(a => a.IsActive && !string.IsNullOrWhiteSpace(a.Url));
            if (videoAsset == null)
            {
                _logger.LogWarning("Lesson {LessonId} does not have an active video asset when updating subtitle", lessonId);
                return new SubtitleUpdateResult
                {
                    Success = false,
                    Message = "Lesson không có video asset."
                };
            }

            try
            {
                _logger.LogInformation(
                    "Updating subtitle for lesson {LessonId} (Text length: {TextLength} chars)",
                    lessonId,
                    subtitleText.Length);

                // 1. Cập nhật Subtitle trong Asset
                videoAsset.SubtitleText = subtitleText;
                videoAsset.IsSubtitleConfirmed = true; // Giáo viên đã duyệt/sửa
                _lessonRepository.UpdateLesson(lesson);
                await _lessonRepository.SaveChangesAsync();

                _logger.LogInformation(
                    "Subtitle saved to Asset for lesson {LessonId}. Starting Qdrant re-indexing...",
                    lessonId);

                // 2. Xóa vector cũ trong Qdrant
                await _qdrantService.DeleteVectorsByLessonAsync(lessonId, ct);

                // 3. Re-Index văn bản mới vào Qdrant
                var indexResult = await _subtitleService.IndexLessonAsync(
                    new SubtitleIndexRequest
                    {
                        LessonId = lesson.Id,
                        CourseId = courseId,
                        LessonTitle = lesson.Title,
                        SubtitleText = subtitleText,
                        SourceVideoUrl = videoAsset.Url
                    },
                    ct);

                _logger.LogInformation(
                    "Successfully re-indexed {ChunkCount} chunks into Qdrant for lesson {LessonId}",
                    indexResult.ChunkCount,
                    lessonId);

                return new SubtitleUpdateResult
                {
                    Success = true,
                    Message = "Cập nhật subtitle và re-index thành công.",
                    ChunkCount = indexResult.ChunkCount,
                    IndexedAt = indexResult.IndexedAt
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to update subtitle for lesson {LessonId}",
                    lessonId);
                return new SubtitleUpdateResult
                {
                    Success = false,
                    Message = $"Lỗi khi cập nhật subtitle: {ex.Message}"
                };
            }
        }
    }
}

