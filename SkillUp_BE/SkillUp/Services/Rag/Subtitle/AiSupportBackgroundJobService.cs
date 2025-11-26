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
            QueueWork(async scope =>
            {
                var courseJob = scope.ServiceProvider.GetRequiredService<ISubtitleCourseJobService>();
                await courseJob.GenerateForCourseAsync(courseId, force, ct);
            }, courseId, null);

            return Task.CompletedTask;
        }

        public Task TriggerLessonSubtitleJobAsync(Guid lessonId, bool force = false, CancellationToken ct = default)
        {
            QueueWork(async scope =>
            {
                var lessonJob = scope.ServiceProvider.GetRequiredService<ISubtitleLessonJobService>();
                await lessonJob.GenerateForLessonAsync(lessonId, force, ct);
            }, null, lessonId);

            return Task.CompletedTask;
        }

        private void QueueWork(
            Func<IServiceScope, Task> work,
            Guid? courseId,
            Guid? lessonId)
        {
            var jobId = Guid.NewGuid();
            var identifier = courseId.HasValue 
                ? $"course {courseId.Value}" 
                : lessonId.HasValue 
                    ? $"lesson {lessonId.Value}" 
                    : "unknown";

            _logger.LogInformation(
                "Queueing background subtitle job [{JobId}] for {Identifier}",
                jobId,
                identifier);

            _ = Task.Run(async () =>
            {
                try
                {
                    _logger.LogInformation(
                        "Background subtitle job [{JobId}] for {Identifier} started",
                        jobId,
                        identifier);

                    using var scope = _scopeFactory.CreateScope();
                    await work(scope);

                    _logger.LogInformation(
                        "Background subtitle job [{JobId}] for {Identifier} completed successfully",
                        jobId,
                        identifier);
                }
                catch (Exception ex)
                {
                    if (courseId.HasValue)
                    {
                        _logger.LogError(
                            ex,
                            "Background subtitle job [{JobId}] failed for course {CourseId}",
                            jobId,
                            courseId.Value);
                    }
                    else if (lessonId.HasValue)
                    {
                        _logger.LogError(
                            ex,
                            "Background subtitle job [{JobId}] failed for lesson {LessonId}",
                            jobId,
                            lessonId.Value);
                    }
                    else
                    {
                        _logger.LogError(
                            ex,
                            "Background subtitle job [{JobId}] failed",
                            jobId);
                    }
                }
            });
        }
    }
}


