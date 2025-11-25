using System.Text;
using Microsoft.Extensions.Logging;
using SkillUp.BussinessObjects.DTOs.Subtitle;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;

namespace SkillUp.Services.Rag.Subtitle
{
    public class SubtitleLessonJobService : ISubtitleLessonJobService
    {
        private readonly ILessonRepository _lessonRepository;
        private readonly GenSubService _genSubService;
        private readonly ISubtitleService _subtitleService;
        private readonly QdrantService _qdrantService;
        private readonly ILogger<SubtitleLessonJobService> _logger;

        public SubtitleLessonJobService(
            ILessonRepository lessonRepository,
            GenSubService genSubService,
            ISubtitleService subtitleService,
            QdrantService qdrantService,
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
            var lesson = await _lessonRepository.GetLessonWithDetailsAsync(lessonId)
                         ?? throw new KeyNotFoundException($"Lesson {lessonId} not found.");

            var courseId = lesson.Section?.CourseId ?? Guid.Empty;

            if (!string.Equals(lesson.Type, "Video", StringComparison.OrdinalIgnoreCase))
            {
                return new SubtitleGenerationJobResult
                {
                    LessonId = lessonId,
                    CourseId = courseId,
                    Success = false,
                    Message = "Lesson type is not Video."
                };
            }

            var videoAsset = lesson.Assets?.FirstOrDefault(a => a.IsActive && !string.IsNullOrWhiteSpace(a.Url));
            if (videoAsset?.Url is null)
            {
                return new SubtitleGenerationJobResult
                {
                    LessonId = lessonId,
                    CourseId = courseId,
                    Success = false,
                    Message = "Lesson does not have an active video asset."
                };
            }

            // Phase 4.5: Skip nếu lesson đã có subtitle (trừ khi force = true)
            if (!force)
            {
                try
                {
                    var hasSubtitle = await _subtitleService.HasSubtitlesAsync(lessonId, ct);
                    if (hasSubtitle)
                    {
                        _logger.LogInformation(
                            "Lesson {LessonId} already has subtitle indexed. Skipping generation.",
                            lessonId);

                        return new SubtitleGenerationJobResult
                        {
                            LessonId = lessonId,
                            CourseId = courseId,
                            Success = true,
                            Message = "Subtitle already exists. Skipped generation.",
                            SourceVideoUrl = videoAsset.Url
                        };
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(
                        ex,
                        "Failed to check existing subtitle for lesson {LessonId}. Proceeding with generation.",
                        lessonId);
                }
            }

            return await GenerateAsync(lesson, videoAsset, courseId, ct);
        }

        private async Task<SubtitleGenerationJobResult> GenerateAsync(
            Lesson lesson,
            Asset videoAsset,
            Guid courseId,
            CancellationToken ct)
        {
            try
            {
                var genSubStart = DateTime.UtcNow;
                var subtitlePayload = await _genSubService.GenerateFromUrlAsync(
                    videoAsset.Url!,
                    format: "text",
                    aiCorrect: true,
                    cancellationToken: ct);
                var genSubDuration = DateTime.UtcNow - genSubStart;

                var subtitleText = !string.IsNullOrEmpty(subtitlePayload.TextContent)
                    ? subtitlePayload.TextContent
                    : Encoding.UTF8.GetString(subtitlePayload.Data ?? Array.Empty<byte>());

                if (string.IsNullOrWhiteSpace(subtitleText))
                {
                    return new SubtitleGenerationJobResult
                    {
                        LessonId = lesson.Id,
                        CourseId = courseId,
                        Success = false,
                        Message = "Generated subtitle text is empty.",
                        SourceVideoUrl = videoAsset.Url,
                        GenSubDuration = genSubDuration
                    };
                }

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

                return new SubtitleGenerationJobResult
                {
                    LessonId = lesson.Id,
                    CourseId = courseId,
                    Success = true,
                    Message = "Subtitle generated and indexed.",
                    IndexResult = indexResult,
                    SourceVideoUrl = videoAsset.Url,
                    GenSubDuration = genSubDuration
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to generate subtitle for lesson {LessonId}", lesson.Id);
                return new SubtitleGenerationJobResult
                {
                    LessonId = lesson.Id,
                    CourseId = courseId,
                    Success = false,
                    Message = ex.Message,
                    SourceVideoUrl = videoAsset.Url
                };
            }
        }
    }
}

