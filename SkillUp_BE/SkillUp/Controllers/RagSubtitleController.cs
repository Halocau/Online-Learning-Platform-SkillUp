using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Subtitle;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Common;
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
        private readonly ISubtitleManagementService _subtitleManagementService;

        public RagSubtitleController(
            IQdrantService qdrantService,
            ISubtitleLessonJobService lessonJobService,
            ISubtitleCourseJobService courseJobService,
            ISubtitleManagementService subtitleManagementService)
        {
            _qdrantService = qdrantService;
            _lessonJobService = lessonJobService;
            _courseJobService = courseJobService;
            _subtitleManagementService = subtitleManagementService;
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

        [HttpGet("lessons/{lessonId}")]
        public async Task<IActionResult> GetLessonSubtitle(Guid lessonId, CancellationToken ct = default)
        {
            var subtitle = await _subtitleManagementService.GetLessonSubtitleAsync(lessonId, ct);

            if (subtitle == null)
            {
                return NotFound(new APIReturn
                {
                    code = 404,
                    message = "Lesson không tồn tại hoặc không có video asset.",
                    data = new List<object>()
                });
            }

            return Ok(new APIReturn
            {
                code = 200,
                message = "Lấy subtitle thành công.",
                data = new List<object> { subtitle }
            });
        }

        [HttpPut("lessons/{lessonId}")]
        public async Task<IActionResult> UpdateLessonSubtitle(
            Guid lessonId,
            [FromBody] string subtitleText,
            CancellationToken ct = default)
        {
            var result = await _subtitleManagementService.UpdateLessonSubtitleAsync(
                lessonId,
                subtitleText,
                ct);

            if (!result.Success)
            {
                var statusCode = result.Message.Contains("không tồn tại") ? 404 :
                                 result.Message.Contains("không được để trống") ? 400 : 500;

                return StatusCode(statusCode, new APIReturn
                {
                    code = statusCode,
                    message = result.Message,
                    data = new List<object>()
                });
            }

            return Ok(new APIReturn
            {
                code = 200,
                message = result.Message,
                data = new List<object>
                {
                    new
                    {
                        lessonId,
                        chunkCount = result.ChunkCount,
                        indexedAt = result.IndexedAt
                    }
                }
            });
        }
    }
}

