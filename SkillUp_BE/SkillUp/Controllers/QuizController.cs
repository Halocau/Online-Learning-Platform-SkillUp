using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Quiz;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuizController : ControllerBase
    {
        private readonly IQuizService _quizService;
        private readonly ICurrentUserService _currentUserService;

        public QuizController(IQuizService quizService, ICurrentUserService currentUserService)
        {
            _quizService = quizService;
            _currentUserService = currentUserService;
        }
        [HttpPost("Add-Quiz")]
        [Authorize]
        public async Task<IActionResult> CreateQuiz([FromBody] CreateQuizDTO request)
        {
            try
            {
                var accountId = _currentUserService.UserId;
                if (!accountId.HasValue)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ hoặc không tìm thấy người dùng",
                        data = new List<object>()
                    });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Dữ liệu không hợp lệ",
                        data = new List<object> { ModelState }
                    });
                }

                var result = await _quizService.CreateQuizAsync(request, accountId.Value);

                if (result == null)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Không thể tạo quiz.",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Tạo quiz thành công",
                    data = new List<object> { result }
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Có lỗi xảy ra: {ex.Message}",
                    data = new List<object>()
                });
            }
        }

        [HttpPut("Update-Quiz/{quizId}")]
        [Authorize]
        public async Task<IActionResult> UpdateQuiz(Guid quizId, [FromBody] UpdateQuizDTO request)
        {
            try
            {
                var accountId = _currentUserService.UserId;
                if (!accountId.HasValue)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ hoặc không tìm thấy người dùng",
                        data = new List<object>()
                    });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Dữ liệu không hợp lệ",
                        data = new List<object> { ModelState }
                    });
                }

                var success = await _quizService.UpdateQuizAsync(quizId, request, accountId.Value);

                if (!success)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Cập nhật quiz thất bại",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Cập nhật quiz thành công",
                    data = new List<object>()
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Có lỗi xảy ra: {ex.Message}",
                    data = new List<object>()
                });
            }
        }

        [HttpDelete("Delete-Quiz/{quizId}")]
        [Authorize]
        public async Task<IActionResult> DeleteQuiz(Guid quizId)
        {
            try
            {
                var accountId = _currentUserService.UserId;
                if (!accountId.HasValue)
                {
                    return Unauthorized(new APIReturn
                    {
                        code = 401,
                        message = "Token không hợp lệ hoặc không tìm thấy người dùng",
                        data = new List<object>()
                    });
                }

                var success = await _quizService.DeleteQuizAsync(quizId, accountId.Value);

                if (!success)
                {
                    return BadRequest(new APIReturn
                    {
                        code = 400,
                        message = "Không thể xóa quiz.",
                        data = new List<object>()
                    });
                }

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Xóa quiz thành công.",
                    data = new List<object>()
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Có lỗi xảy ra: {ex.Message}",
                    data = new List<object>()
                });
            }
        }




    }
}
