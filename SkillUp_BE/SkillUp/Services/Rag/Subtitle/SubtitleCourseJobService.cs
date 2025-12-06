using Microsoft.Extensions.Logging;
using System.Linq;
using SkillUp.BussinessObjects.DTOs.Subtitle;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Services.Rag.Subtitle
{
    public class SubtitleCourseJobService : ISubtitleCourseJobService
    {
        private readonly ICourseRepository _courseRepository;
        private readonly ISubtitleLessonJobService _lessonJob;
        private readonly ILogger<SubtitleCourseJobService> _logger;

        public SubtitleCourseJobService(
            ICourseRepository courseRepository,
            ISubtitleLessonJobService lessonJob,
            ILogger<SubtitleCourseJobService> logger)
        {
            _courseRepository = courseRepository;
            _lessonJob = lessonJob;
            _logger = logger;
        }

        public async Task<SubtitleCourseJobResult> GenerateForCourseAsync(
            Guid courseId,
            bool force = false,
            CancellationToken ct = default)
        {
            var course = await _courseRepository.GetCourseWithDetailsAsync(courseId)
                         ?? throw new KeyNotFoundException($"Course {courseId} not found.");

            var lessons = ExtractVideoLessons(course)
                .DistinctBy(l => l.Id)
                .ToList();

            var result = new SubtitleCourseJobResult
            {
                CourseId = courseId,
                TotalLessons = lessons.Count
            };

            foreach (var lesson in lessons)
            {
                ct.ThrowIfCancellationRequested();
                try
                {
                    var lessonResult = await _lessonJob.GenerateForLessonAsync(lesson.Id, force, ct);
                    result.LessonResults.Add(lessonResult);
                    if (lessonResult.Success)
                        result.CompletedLessons++;
                    else
                        result.FailedLessons++;
                }
                catch (Exception ex)
                {
                    _logger.LogError(
                        ex,
                        "Failed to generate subtitle for lesson {LessonId} in course {CourseId}",
                        lesson.Id,
                        courseId);

                    result.FailedLessons++;
                    result.LessonResults.Add(
                        new SubtitleGenerationJobResult
                        {
                            LessonId = lesson.Id,
                            CourseId = courseId,
                            Success = false,
                            Message = ex.Message
                        }
                    );
                }
            }

            return result;
        }

        private static IEnumerable<Lesson> ExtractVideoLessons(Course course)
        {
            if (course.Sections == null) yield break;

            foreach (var section in course.Sections.Where(s => s.IsActive))
            {
                if (section.Lessons == null) continue;
                foreach (var lesson in section.Lessons)
                {
                    if (!lesson.IsActive) continue;
                    if (!string.Equals(lesson.Type, "Video", StringComparison.OrdinalIgnoreCase)) continue;
                    yield return lesson;
                }
            }
        }
    }
}

