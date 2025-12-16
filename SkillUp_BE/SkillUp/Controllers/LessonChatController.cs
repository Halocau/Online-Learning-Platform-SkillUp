using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Rag;
using SkillUp.ExceptionHandling;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using SkillUp.Services.Rag.Chat;

namespace SkillUp.Controllers
{
    [Route("api/lessons/{lessonId:guid}/chat")]
    [ApiController]
    [Authorize]
    public class LessonChatController : ControllerBase
    {
        private readonly ILessonChatService _lessonChatService;
        private readonly ILessonRepository _lessonRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly IEnrollmentRepository _enrollmentRepository;
        private readonly ICurrentUserService _currentUserService;

        public LessonChatController(
            ILessonChatService lessonChatService,
            ILessonRepository lessonRepository,
            IStudentRepository studentRepository,
            IEnrollmentRepository enrollmentRepository,
            ICurrentUserService currentUserService)
        {
            _lessonChatService = lessonChatService;
            _lessonRepository = lessonRepository;
            _studentRepository = studentRepository;
            _enrollmentRepository = enrollmentRepository;
            _currentUserService = currentUserService;
        }

        [HttpPost]
        public async Task<IActionResult> ChatAsync(
            Guid lessonId,
            [FromBody] ChatRequestDto request,
            CancellationToken ct)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Question))
            {
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = "Vui lòng nhập câu hỏi.",
                    data = new List<object>()
                });
            }

            var accountId = _currentUserService.UserId;
            if (!accountId.HasValue)
            {
                return Unauthorized(new APIReturn
                {
                    code = 401,
                    message = "Không xác định được người dùng.",
                    data = new List<object>()
                });
            }

            var student = await _studentRepository.GetStudentByAccountIdAsync(accountId.Value);
            if (student == null)
            {
                return StatusCode(403, new APIReturn
                {
                    code = 403,
                    message = "Chỉ học viên mới có thể sử dụng tính năng này.",
                    data = new List<object>()
                });
            }

            var lesson = await _lessonRepository.GetLessonWithDetailsAsync(lessonId);
            if (lesson == null || !lesson.IsActive)
            {
                return NotFound(new APIReturn
                {
                    code = 404,
                    message = "Không tìm thấy bài học.",
                    data = new List<object>()
                });
            }

            var course = lesson.Section?.Course;
            if (course == null)
            {
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = "Bài học không thuộc bất kỳ khóa học nào.",
                    data = new List<object>()
                });
            }

            if (course.IsAiSupport != true)
            {
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = "Khóa học chưa bật AI hỗ trợ.",
                    data = new List<object>()
                });
            }

            var enrolled = await _enrollmentRepository.IsStudentEnrolledInCourseAsync(student.Id, course.Id);
            if (!enrolled)
            {
                return StatusCode(403, new APIReturn
                {
                    code = 403,
                    message = "Bạn chưa tham gia khóa học này.",
                    data = new List<object>()
                });
            }

            var chatResponse = await _lessonChatService.ChatAsync(lessonId, request.Question, ct);
            if (!chatResponse.Success)
            {
                return BadRequest(new APIReturn
                {
                    code = 400,
                    message = chatResponse.Message,
                    data = new List<object> { chatResponse }
                });
            }

            return Ok(new APIReturn
            {
                code = 200,
                message = "Trả lời thành công.",
                data = new List<object> { chatResponse }
            });
        }
    }
}

