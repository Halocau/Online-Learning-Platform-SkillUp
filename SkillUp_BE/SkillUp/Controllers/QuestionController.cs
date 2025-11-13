using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client;
using SkillUp.BussinessObjects.DTOs.Question;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuestionController : ControllerBase
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IQuestionService _questionService;

        public QuestionController(ICurrentUserService currentUserService , IQuestionService questionService)
        {
            _currentUserService = currentUserService;
            _questionService = questionService;
        }

        [HttpPost("AddQuestionToQuiz")]
        [Authorize]
        public async Task<IActionResult> AddQuestionToQuiz([FromForm] CreateQuestionDTO dto)
        {
            try
            {
                var accId = _currentUserService.UserId;
                if (!accId.HasValue)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ hoặc không tìm thấy người dùng",
                        data = new List<object>()
                    });
                }
                var newQuestion = await _questionService.AddQuestionWithAnswersToQuizAsync(dto, accId.Value);


                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Thêm câu hỏi thành công",
                    data = new List<object> { newQuestion }
                });
            }
            catch (UnauthorizedAccessException ex)
            {

                return Forbid();
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Không tìm thấy giảng viên") ||
                    ex.Message.Contains("Quiz không tồn tại"))
                {
                    return NotFound(new APIReturn { code = 404, message = ex.Message, data = new List<object>() });
                }
                if (ex.Message.Contains("Lỗi: Không thể lưu"))
                {
                    return BadRequest(new APIReturn { code = 400, message = ex.Message, data = new List<object>() });
                }
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Có lỗi xảy ra: {ex.Message}",
                    data = new List<object>()
                });
            }
        }
        [HttpPut("UpdateQuestion/{questionId}")]
        public async Task<IActionResult> UpdateQuestion(Guid questionId, [FromBody] UpdateQuestionDTO dto)
        {
            try
            {
                var accId = _currentUserService.UserId;
                if (!accId.HasValue)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ hoặc không tìm thấy người dùng",
                        data = new List<object>()
                    });
                }

                var success = await _questionService.UpdateQuestionWithAnswersAsync(questionId, dto, accId.Value);

                if (!success)
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Cập nhật câu hỏi thất bại"
                    });

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Cập nhật câu hỏi thành công"
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new APIReturn
                {
                    code = 401,
                    message = ex.Message
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = ex.Message
                });
            }
        }

        [HttpPost("add-from-bank")]
        public async Task<IActionResult> AddQuestionFromBankToQuiz([FromBody]List<CreateQuestionQuizDTO> createQuestionQuizDTO)
        {
			try
			{
				var accId = _currentUserService.UserId;
				if (!accId.HasValue)
				{
					return Unauthorized(new APIReturn
					{
						code = 401,
						message = "Token không hợp lệ hoặc không tìm thấy người dùng",
						data = new List<object>()
					});
				}
				var success = await _questionService.AddBulkQuestionFromBankToQuizAsync(createQuestionQuizDTO, accId.Value);

				if (!success)
					return BadRequest(new APIReturn { code = 400, message = "Thêm câu hỏi thất bại" });

				return Ok(new APIReturn
				{
					code = 200,
					message = "Thêm câu hỏi thành công"
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn { code = 500, message = ex.Message });
			}
		}
    }
}
