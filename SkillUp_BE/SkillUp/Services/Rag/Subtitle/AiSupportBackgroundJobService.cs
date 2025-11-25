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
            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    await work(scope);
                }
                catch (Exception ex)
                {
                    if (courseId.HasValue)
                    {
                        _logger.LogError(
                            ex,
                            "Background subtitle job failed for course {CourseId}",
                            courseId.Value);
                    }
                    else if (lessonId.HasValue)
                    {
                        _logger.LogError(
                            ex,
                            "Background subtitle job failed for lesson {LessonId}",
                            lessonId.Value);
                    }
                    else
                    {
                        _logger.LogError(ex, "Background subtitle job failed.");
                    }
                }
            });
        }
    }
}


