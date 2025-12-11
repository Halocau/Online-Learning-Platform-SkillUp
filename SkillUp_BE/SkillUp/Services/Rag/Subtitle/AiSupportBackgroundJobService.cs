using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace SkillUp.Services.Rag.Subtitle
{
    public class AiSupportBackgroundJobService : IAiSupportBackgroundJobService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<AiSupportBackgroundJobService> _logger;

        public AiSupportBackgroundJobService(
            IServiceScopeFactory scopeFactory,
            ILogger<AiSupportBackgroundJobService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        public Task TriggerCourseSubtitleJobAsync(Guid courseId, bool force = false, CancellationToken ct = default)
        {
            QueueWork(courseId, null, force, ct);
            return Task.CompletedTask;
        }

        public Task TriggerLessonSubtitleJobAsync(Guid lessonId, bool force = false, CancellationToken ct = default)
        {
            QueueWork(null, lessonId, force, ct);
            return Task.CompletedTask;
        }

        private void QueueWork(
            Guid? courseId,
            Guid? lessonId,
            bool force,
            CancellationToken cancellationToken)
        {
            var jobId = Guid.NewGuid();
            var identifier = GetJobIdentifier(courseId, lessonId);

            _logger.LogInformation(
                "Queueing background subtitle job [{JobId}] for {Identifier}",
                jobId,
                identifier);

            _ = Task.Run(() => ExecuteBackgroundWorkAsync(jobId, courseId, lessonId, identifier, force, cancellationToken));
        }

        private async Task ExecuteBackgroundWorkAsync(
            Guid jobId,
            Guid? courseId,
            Guid? lessonId,
            string identifier,
            bool force,
            CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation(
                    "Background subtitle job [{JobId}] for {Identifier} started",
                    jobId,
                    identifier);

                using var scope = _scopeFactory.CreateScope();

                if (courseId.HasValue)
                {
                    await ExecuteCourseSubtitleJobAsync(scope, courseId.Value, force, cancellationToken);
                }
                else if (lessonId.HasValue)
                {
                    await ExecuteLessonSubtitleJobAsync(scope, lessonId.Value, force, cancellationToken);
                }

                _logger.LogInformation(
                    "Background subtitle job [{JobId}] for {Identifier} completed successfully",
                    jobId,
                    identifier);
            }
            catch (Exception ex)
            {
                LogJobError(jobId, courseId, lessonId, ex);
            }
        }

        private async Task ExecuteCourseSubtitleJobAsync(
            IServiceScope scope,
            Guid courseId,
            bool force,
            CancellationToken cancellationToken)
        {
            var courseJob = scope.ServiceProvider.GetRequiredService<ISubtitleCourseJobService>();
            await courseJob.GenerateForCourseAsync(courseId, force, cancellationToken);
        }

        private async Task ExecuteLessonSubtitleJobAsync(
            IServiceScope scope,
            Guid lessonId,
            bool force,
            CancellationToken cancellationToken)
        {
            var lessonJob = scope.ServiceProvider.GetRequiredService<ISubtitleLessonJobService>();
            await lessonJob.GenerateForLessonAsync(lessonId, force, cancellationToken);
        }

        private static string GetJobIdentifier(Guid? courseId, Guid? lessonId)
        {
            return courseId.HasValue 
                ? $"course {courseId.Value}" 
                : lessonId.HasValue 
                    ? $"lesson {lessonId.Value}" 
                    : "unknown";
        }

        private void LogJobError(Guid jobId, Guid? courseId, Guid? lessonId, Exception ex)
        {
            var identifier = GetJobIdentifier(courseId, lessonId);
            _logger.LogError(
                ex,
                "Background subtitle job [{JobId}] failed for {Identifier}",
                jobId,
                identifier);
        }
    }
}


