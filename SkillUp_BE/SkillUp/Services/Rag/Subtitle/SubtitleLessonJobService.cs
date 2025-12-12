using System.Text;
using Microsoft.Extensions.Logging;
using SkillUp.BussinessObjects.DTOs.Subtitle;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Rag.Subtitle
{
    public class SubtitleLessonJobService : ISubtitleLessonJobService
    {
        private readonly ILessonRepository _lessonRepository;
        private readonly GenSubService _genSubService;
        private readonly ISubtitleService _subtitleService;
        private readonly IQdrantService _qdrantService;
        private readonly ILogger<SubtitleLessonJobService> _logger;

        public SubtitleLessonJobService(
            ILessonRepository lessonRepository,
            GenSubService genSubService,
            ISubtitleService subtitleService,
            IQdrantService qdrantService,
            ILogger<SubtitleLessonJobService> logger)
        {
            _lessonRepository = lessonRepository;
            _genSubService = genSubService;
            _subtitleService = subtitleService;
            _qdrantService = qdrantService;
            _logger = logger;
        }

        public async Task<SubtitleGenerationJobResult> GenerateForLessonAsync(
            Guid lessonId,
            bool force = false,
            CancellationToken ct = default)
        {
            _logger.LogInformation(
                "SubtitleGenerationJobService: Starting job for lesson {LessonId} (force={Force})",
                lessonId,
                force);

            var lesson = await _lessonRepository.GetLessonWithDetailsAsync(lessonId)
                         ?? throw new KeyNotFoundException($"Lesson {lessonId} not found.");

            var courseId = lesson.Section?.CourseId ?? Guid.Empty;

            // Validate lesson type
            if (!string.Equals(lesson.Type, "Video", StringComparison.OrdinalIgnoreCase))
                return CreateResult(lessonId, courseId, false, "Lesson type is not Video.");

            // Get video asset
            var videoAsset = lesson.Assets?.FirstOrDefault(a => a.IsActive && !string.IsNullOrWhiteSpace(a.Url));
            if (videoAsset?.Url is null)
                return CreateResult(lessonId, courseId, false, "Lesson does not have an active video asset.");

            // Skip if subtitle already exists (unless forced)
            if (!force && await CheckAndSkipIfExistsAsync(lessonId, videoAsset.Url, courseId, ct))
                return CreateResult(lessonId, courseId, true, "Subtitle already exists. Skipped generation.", videoAsset.Url);

            return await GenerateAsync(lesson, videoAsset, courseId, ct);
        }

        private async Task<bool> CheckAndSkipIfExistsAsync(Guid lessonId, string videoUrl, Guid courseId, CancellationToken ct)
        {
            try
            {
                if (await _subtitleService.HasSubtitlesAsync(lessonId, ct))
                {
                    _logger.LogInformation("Lesson {LessonId} already has subtitle indexed. Skipping generation.", lessonId);
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to check existing subtitle for lesson {LessonId}. Proceeding with generation.", lessonId);
            }
            return false;
        }

        private async Task<SubtitleGenerationJobResult> GenerateAsync(
            Lesson lesson,
            Asset videoAsset,
            Guid courseId,
            CancellationToken ct)
        {
            try
            {
                _logger.LogInformation(
                    "Starting subtitle generation for lesson {LessonId} (Video: {VideoUrl})",
                    lesson.Id,
                    videoAsset.Url);

                // Generate subtitle from video
                var genSubStart = DateTime.Now;
                var subtitlePayload = await _genSubService.GenerateFromUrlAsync(
                    videoAsset.Url!,
                    format: "text",
                    aiCorrect: true,
                    cancellationToken: ct);
                var genSubDuration = DateTime.Now - genSubStart;

                _logger.LogInformation(
                    "GenSub completed for lesson {LessonId} in {Duration}ms. Starting Qdrant indexing...",
                    lesson.Id,
                    genSubDuration.TotalMilliseconds);

                // Extract subtitle text
                var subtitleText = subtitlePayload.TextContent 
                    ?? Encoding.UTF8.GetString(subtitlePayload.Data ?? Array.Empty<byte>());

                if (string.IsNullOrWhiteSpace(subtitleText))
                {
                    _logger.LogWarning("Generated subtitle text is empty for lesson {LessonId}", lesson.Id);
                    return CreateResult(lesson.Id, courseId, false, "Generated subtitle text is empty.", videoAsset.Url, genSubDuration);
                }

                _logger.LogInformation(
                    "Subtitle text received for lesson {LessonId} ({TextLength} chars). Starting Qdrant indexing...",
                    lesson.Id,
                    subtitleText.Length);

                // Index to Qdrant
                var indexStart = DateTime.Now;
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
                var indexDuration = DateTime.Now - indexStart;

                _logger.LogInformation(
                    "Successfully indexed {ChunkCount} chunks into Qdrant for lesson {LessonId} in {Duration}ms. Total time: {TotalDuration}ms",
                    indexResult.ChunkCount,
                    lesson.Id,
                    indexDuration.TotalMilliseconds,
                    (genSubDuration + indexDuration).TotalMilliseconds);

                return CreateResult(lesson.Id, courseId, true, "Subtitle generated and indexed.", videoAsset.Url, genSubDuration, indexResult);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to generate subtitle for lesson {LessonId} (Video: {VideoUrl})",
                    lesson.Id,
                    videoAsset.Url);
                return CreateResult(lesson.Id, courseId, false, ex.Message, videoAsset.Url);
            }
        }

        private SubtitleGenerationJobResult CreateResult(
            Guid lessonId,
            Guid courseId,
            bool success,
            string message,
            string? videoUrl = null,
            TimeSpan? genSubDuration = null,
            SubtitleIndexResult? indexResult = null)
        {
            return new SubtitleGenerationJobResult
            {
                LessonId = lessonId,
                CourseId = courseId,
                Success = success,
                Message = message,
                SourceVideoUrl = videoUrl,
                GenSubDuration = genSubDuration,
                IndexResult = indexResult
            };
        }
    }
}

