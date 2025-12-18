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
        private readonly INotifyService _notifyService;
        private readonly ICourseRepository _courseRepository;

        public SubtitleLessonJobService(
            ILessonRepository lessonRepository,
            GenSubService genSubService,
            ISubtitleService subtitleService,
            IQdrantService qdrantService,
            ILogger<SubtitleLessonJobService> logger,
            INotifyService notifyService,
            ICourseRepository courseRepository)
        {
            _lessonRepository = lessonRepository;
            _genSubService = genSubService;
            _subtitleService = subtitleService;
            _qdrantService = qdrantService;
            _logger = logger;
            _notifyService = notifyService;
            _courseRepository = courseRepository;
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
            // Check both: SubtitleText in Asset AND Qdrant index
            if (!force && await CheckAndSkipIfExistsAsync(lessonId, videoAsset, courseId, ct))
                return CreateResult(lessonId, courseId, true, "Subtitle already exists. Skipped generation.", videoAsset.Url);

            return await GenerateAsync(lesson, videoAsset, courseId, ct);
        }

        private async Task<bool> CheckAndSkipIfExistsAsync(Guid lessonId, Asset videoAsset, Guid courseId, CancellationToken ct)
        {
            try
            {
                // Check 1: SubtitleText đã có trong Asset chưa?
                if (!string.IsNullOrWhiteSpace(videoAsset.SubtitleText))
                {
                    _logger.LogInformation(
                        "Lesson {LessonId} already has SubtitleText in Asset. Skipping generation.",
                        lessonId);
                    return true;
                }

                // Check 2: Subtitle đã được index vào Qdrant chưa?
                if (await _subtitleService.HasSubtitlesAsync(lessonId, ct))
                {
                    _logger.LogInformation(
                        "Lesson {LessonId} already has subtitle indexed in Qdrant. Skipping generation.",
                        lessonId);
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "Failed to check existing subtitle for lesson {LessonId}. Proceeding with generation.",
                    lessonId);
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
                    "Subtitle text received for lesson {LessonId} ({TextLength} chars). Saving to Asset and starting Qdrant indexing...",
                    lesson.Id,
                    subtitleText.Length);

                // Save Subtitle to Asset (for teacher review/editing)
                videoAsset.SubtitleText = subtitleText;
                videoAsset.IsSubtitleConfirmed = false; // AI generated, not yet confirmed by teacher
                _lessonRepository.UpdateAsset(videoAsset);
                await _lessonRepository.SaveChangesAsync();

                _logger.LogInformation(
                    "Subtitle saved to Asset for lesson {LessonId}. Starting Qdrant indexing...",
                    lesson.Id);

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

                // Gửi notification cho giảng viên
                await SendSubtitleNotificationAsync(lesson, courseId, ct);

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

        private async Task SendSubtitleNotificationAsync(
            Lesson lesson,
            Guid courseId,
            CancellationToken ct)
        {
            try
            {
                // Sử dụng GetCourseWithDetailsAsync để load đầy đủ Lecturer và Account
                var course = await _courseRepository.GetCourseWithDetailsAsync(courseId);
                if (course?.Lecturer == null)
                {
                    _logger.LogWarning("Cannot send notification: Course {CourseId} or Lecturer not found", courseId);
                    return;
                }

                var notificationTitle = "Phụ đề đã được tạo tự động thành công";
                var notificationMessage = $"Phụ đề cho bài học \"{lesson.Title}\" đã được tạo thành công. Bạn có thể xem và chỉnh sửa phụ đề trong trang quản lý khóa học.";
                var hyperlink = $"/lecturer/courses/{courseId}";

                var accountId = course.Lecturer.AccountId;
                await _notifyService.CreateNotificationAsync(
                    accountId,
                    notificationTitle,
                    notificationMessage,
                    hyperlink);

                _logger.LogInformation(
                    "Notification sent successfully to lecturer AccountId={AccountId} for lesson {LessonId} (Title: {LessonTitle})",
                    accountId,
                    lesson.Id,
                    lesson.Title);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to send notification for lesson {LessonId} subtitle",
                    lesson.Id);
                // Không throw exception để không ảnh hưởng đến quá trình tạo subtitle
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

