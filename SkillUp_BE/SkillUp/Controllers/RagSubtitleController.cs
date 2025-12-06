using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Common;
using SkillUp.Services.Interfaces;
using SkillUp.Services.Rag.Subtitle;

namespace SkillUp.Controllers
{
    [Route("api/rag/subtitles")]
    [ApiController]
    [Authorize]
    public class RagSubtitleController : ControllerBase
    {
        private readonly IQdrantService _qdrantService;
        private readonly ISubtitleLessonJobService _lessonJobService;
        private readonly ISubtitleCourseJobService _courseJobService;

        public RagSubtitleController(
            IQdrantService qdrantService,
            ISubtitleLessonJobService lessonJobService,
            ISubtitleCourseJobService courseJobService)
        {
            _qdrantService = qdrantService;
            _lessonJobService = lessonJobService;
            _courseJobService = courseJobService;
        }
        [HttpPost("lessons/{lessonId}/ensure")]
        public async Task<IActionResult> EnsureLessonSubtitle(
            Guid lessonId,
            [FromQuery] bool force = false,
            CancellationToken ct = default)
        {
            var existingCount = await _qdrantService.CountVectorsAsync(lessonId: lessonId, ct: ct);
            if (existingCount > 0 && !force)
            {
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lesson đã có phụ đề, không cần tạo lại.",
                    data = new List<object>
                    {
                        new
                        {
                            lessonId,
                            vectorCount = existingCount,
                            skipped = true
                        }
                    }
                });
            }

            var result = await _lessonJobService.GenerateForLessonAsync(lessonId, force, ct);
            var updatedCount = await _qdrantService.CountVectorsAsync(lessonId: lessonId, ct: ct);

            if (!result.Success)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Tạo phụ đề thất bại: {result.Message}",
                    data = new List<object> { result }
                });
            }

            return Ok(new APIReturn
            {
                code = 200,
                message = "Đã tạo phụ đề cho lesson.",
                data = new List<object>
                {
                    new
                    {
                        lessonId,
                        vectorCount = updatedCount,
                        job = result
                    }
                }
            });
        }

        [HttpPost("courses/{courseId}/ensure")]
        public async Task<IActionResult> EnsureCourseSubtitle(
            Guid courseId,
            [FromQuery] bool force = false,
            CancellationToken ct = default)
        {
            var existingCount = await _qdrantService.CountVectorsAsync(courseId: courseId, ct: ct);
            if (existingCount > 0 && !force)
            {
                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Course đã có phụ đề, không cần tạo lại.",
                    data = new List<object>
                    {
                        new
                        {
                            courseId,
                            vectorCount = existingCount,
                            skipped = true
                        }
                    }
                });
            }

            var result = await _courseJobService.GenerateForCourseAsync(courseId, force, ct);
            var updatedCount = await _qdrantService.CountVectorsAsync(courseId: courseId, ct: ct);

            if (!result.Success)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = "Tạo phụ đề cho course bị lỗi.",
                    data = new List<object> { result }
                });
            }

            return Ok(new APIReturn
            {
                code = 200,
                message = "Đã tạo phụ đề cho course.",
                data = new List<object>
                {
                    new
                    {
                        courseId,
                        vectorCount = updatedCount,
                        job = result
                    }
                }
            });
        }
    }
}

