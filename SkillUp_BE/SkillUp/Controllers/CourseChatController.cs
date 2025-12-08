using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Rag;
using SkillUp.ExceptionHandling;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using SkillUp.Services.Rag.Chat;

namespace SkillUp.Controllers
{
    [Route("api/courses/{courseId:guid}/chat")]
    [ApiController]
    [Authorize]
    public class CourseChatController : ControllerBase
    {
        private readonly ICourseChatService _courseChatService;
        private readonly ICourseRepository _courseRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly IEnrollmentRepository _enrollmentRepository;
        private readonly ICurrentUserService _currentUserService;

        public CourseChatController(
            ICourseChatService courseChatService,
            ICourseRepository courseRepository,
            IStudentRepository studentRepository,
            IEnrollmentRepository enrollmentRepository,
            ICurrentUserService currentUserService)
        {
            _courseChatService = courseChatService;
            _courseRepository = courseRepository;
            _studentRepository = studentRepository;
            _enrollmentRepository = enrollmentRepository;
            _currentUserService = currentUserService;
        }

        [HttpPost]
        public async Task<IActionResult> ChatAsync(
            Guid courseId,
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

            var course = await _courseRepository.GetCourseByIdAsync(courseId);
            if (course == null)
            {
                return NotFound(new APIReturn
                {
                    code = 404,
                    message = "Không tìm thấy khóa học.",
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

            var enrolled = await _enrollmentRepository.IsStudentEnrolledInCourseAsync(student.Id, courseId);
            if (!enrolled)
            {
                return StatusCode(403, new APIReturn
                {
                    code = 403,
                    message = "Bạn chưa tham gia khóa học này.",
                    data = new List<object>()
                });
            }

            var chatResponse = await _courseChatService.ChatAsync(courseId, request.Question, ct);
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

