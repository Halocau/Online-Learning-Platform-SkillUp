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
            _logger.LogInformation("Starting subtitle generation for course {CourseId} (force={Force})", courseId, force);

            var course = await _courseRepository.GetCourseWithDetailsAsync(courseId)
                         ?? throw new KeyNotFoundException($"Course {courseId} not found.");

            // Lấy tất cả video lessons từ course (loại bỏ trùng lặp)
            var lessons = ExtractVideoLessons(course)
                .DistinctBy(l => l.Id)
                .ToList();

            _logger.LogInformation("Found {LessonCount} video lessons in course {CourseId}", lessons.Count, courseId);

            var result = new SubtitleCourseJobResult
            {
                CourseId = courseId,
                TotalLessons = lessons.Count
            };

            // Xử lý từng lesson tuần tự (có thể parallelize sau nếu cần)
            foreach (var lesson in lessons)
            {
                ct.ThrowIfCancellationRequested();
                
                var lessonResult = await ProcessLessonAsync(lesson, courseId, force, ct);
                result.LessonResults.Add(lessonResult);
                
                if (lessonResult.Success)
                    result.CompletedLessons++;
                else
                    result.FailedLessons++;
            }

            _logger.LogInformation(
                "Completed subtitle generation for course {CourseId}: {Completed}/{Total} successful",
                courseId, result.CompletedLessons, result.TotalLessons);

            return result;
        }

        private async Task<SubtitleGenerationJobResult> ProcessLessonAsync(
            Lesson lesson,
            Guid courseId,
            bool force,
            CancellationToken ct)
        {
            try
            {
                return await _lessonJob.GenerateForLessonAsync(lesson.Id, force, ct);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Failed to generate subtitle for lesson {LessonId} in course {CourseId}",
                    lesson.Id,
                    courseId);

                return new SubtitleGenerationJobResult
                {
                    LessonId = lesson.Id,
                    CourseId = courseId,
                    Success = false,
                    Message = ex.Message
                };
            }
        }

        /// <summary>
        /// Trích xuất tất cả video lessons từ course (chỉ lấy active sections và lessons).
        /// </summary>
        private static IEnumerable<Lesson> ExtractVideoLessons(Course course)
        {
            if (course.Sections == null)
                yield break;

            foreach (var section in course.Sections.Where(s => s.IsActive))
            {
                if (section.Lessons == null)
                    continue;

                foreach (var lesson in section.Lessons)
                {
                    // Chỉ lấy active video lessons
                    if (!lesson.IsActive)
                        continue;
                    
                    if (!string.Equals(lesson.Type, "Video", StringComparison.OrdinalIgnoreCase))
                        continue;
                    
                    yield return lesson;
                }
            }
        }
    }
}

