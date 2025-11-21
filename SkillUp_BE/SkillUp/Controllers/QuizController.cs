using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.DoQuiz;
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

                var newQuizId = await _quizService.CreateQuizAsync(request, accountId.Value);

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Tạo quiz thành công",
                    data = new List<object> { new { quizId = newQuizId } }
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Không tìm thấy giảng viên") ||
                    ex.Message.Contains("Không tìm thấy section"))
                {
                    return NotFound(new APIReturn { code = 404, message = ex.Message, data = new List<object>() });
                }
                if (ex.Message.Contains("Lỗi: Không thể lưu bài quiz"))
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

        [HttpGet("View-Quiz/{quizId}")]
        [Authorize]
        public async Task<IActionResult> ViewQuiz(Guid quizId)
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

                var quizDetail = await _quizService.GetQuizDetailAsync(quizId, accountId.Value);

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Lấy quiz thành công",
                    data = new List<object> { quizDetail }
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Không tìm thấy quiz") ||
                    ex.Message.Contains("Không tìm thấy giảng viên") ||
                    ex.Message.Contains("Bài quiz này đang bị ẩn"))
                {
                    return NotFound(new APIReturn { code = 404, message = ex.Message, data = new List<object>() });
                }

                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Có lỗi xảy ra: {ex.Message}",
                    data = new List<object>()
                });
            }
        }
        [HttpPost("{quizId}/start")]
        [Authorize]
        public async Task<IActionResult> StartQuiz(Guid quizId)
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

                var quizStartData = await _quizService.StartQuizAsync(quizId, accountId.Value);

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Bắt đầu làm bài",
                    data = new List<object> { quizStartData }
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Bài quiz không tồn tại"))
                {
                    return NotFound(new APIReturn { code = 404, message = ex.Message, data = new List<object>() });
                }
                return StatusCode(500, new APIReturn
                {
                    code = 500,
                    message = $"Có lỗi xảy ra: {ex.Message}",
                    data = new List<object>()
                });
            }
        }
        [HttpPost("submit/{submissionId}")]
        [Authorize]
        public async Task<IActionResult> SubmitQuiz(Guid submissionId, [FromBody] QuizSubmitDto submitDto)
        {
            try
            {
                var accountId = _currentUserService.UserId;
                if (!accountId.HasValue)
                {
                    return Unauthorized(new APIReturn { code = 401, message = "Token không hợp lệ", data = new List<object>() });
                }

                var result = await _quizService.SubmitQuizAsync(submissionId, submitDto, accountId.Value);

                return Ok(new APIReturn
                {
                    code = 200,
                    message = "Nộp bài thành công",
                    data = new List<object> { result } 
                });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("Không tìm thấy"))
                {
                    return NotFound(new APIReturn { code = 404, message = ex.Message, data = new List<object>() });
                }
                if (ex.Message.Contains("đã được nộp trước đó"))
                {
                    return BadRequest(new APIReturn { code = 400, message = ex.Message, data = new List<object>() });
                }

                return StatusCode(500, new APIReturn { code = 500, message = $"Có lỗi xảy ra: {ex.Message}", data = new List<object>() });
            }
        }


    }
}
