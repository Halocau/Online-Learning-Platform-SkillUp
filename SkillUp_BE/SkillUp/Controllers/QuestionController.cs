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
        public async Task<IActionResult> AddQuestionToQuiz([FromBody] CreateQuestionDTO dto)
        {
            try
            {
                var accId =  _currentUserService.UserId;
                if (!accId.HasValue)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ hoặc không tìm thấy người dùng",
                        data = new List<object>()
                    });
                }
                var success = await _questionService.AddQuestionWithAnswersToQuizAsync(dto, accId.Value);

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
