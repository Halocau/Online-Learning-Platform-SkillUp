namespace SkillUp.Services.Rag.Subtitle
{
    public interface IAiSupportBackgroundJobService
    {
        Task TriggerCourseSubtitleJobAsync(Guid courseId, bool force = false, CancellationToken ct = default);

        Task TriggerLessonSubtitleJobAsync(Guid lessonId, bool force = false, CancellationToken ct = default);
    }
}


