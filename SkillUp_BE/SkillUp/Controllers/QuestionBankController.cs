using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.QuestionBank;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class QuestionBankController : ControllerBase
	{
		private readonly IQuestionBankService _questionBankService;
		private readonly ICurrentUserService _currentUserService;
		public QuestionBankController(IQuestionBankService questionBankService, ICurrentUserService currentUserService)
		{
			_questionBankService = questionBankService;
			_currentUserService = currentUserService;
		}

		[HttpPost("create")]
		public async Task<IActionResult> CreateQuestionBank([FromBody] CreateQuestionBankDTO createQuestionBankDTO, Guid courseId)
		{
			try
			{
				var accountId = _currentUserService.UserId;
				
				if (accountId == null)
				{
					return Unauthorized(new APIReturn
					{
						code = 401,
						message = "Bạn cần đăng nhập để thực hiện hành động này.",
						data = new List<object>()
					});
				}

				if (!ModelState.IsValid)
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Thông tin không hợp lệ.",
						data = new List<object>()
					});
				}

				var result = await _questionBankService.CreateQuestionBankAsync(createQuestionBankDTO, accountId.Value, courseId);
				return Ok(new APIReturn
				{
					code = 200,
					message = "Tạo ngân hàng câu hỏi thành công!",
					data = new List<object> { result }
				});
			}
			catch (UnauthorizedAccessException ex)
			{
				return StatusCode(403, new APIReturn
				{
					code = 403,
					message = ex.Message,
					data = new List<object>()
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = "Có lỗi xảy ra: " + ex.Message,
					data = new List<object>()
				});
			}
		}

		[HttpPut("update/{questionBankId}")]
		public async Task<IActionResult> UpdateQuestionBank([FromBody] UpdateQuestionBankDTO updateQuestionBankDTO, Guid questionBankId, Guid courseId)
		{
			try
			{
				var accountId = _currentUserService.UserId;
				if (accountId == null)
				{
					return Unauthorized(new APIReturn
					{
						code = 401,
						message = "Bạn cần đăng nhập để thực hiện hành động này.",
						data = new List<object>()
					});
				}
				if (!ModelState.IsValid)
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Thông tin không hợp lệ.",
						data = new List<object>()
					});
				}
				var result = await _questionBankService.UpdateQuestionBank(updateQuestionBankDTO, questionBankId, accountId.Value, courseId);
				return Ok(new APIReturn
				{
					code = 200,
					message = "Cập nhật ngân hàng câu hỏi thành công!",
					data = new List<object> { result }
				});
			}
			catch (UnauthorizedAccessException ex)
			{
				return StatusCode(403, new APIReturn
				{
					code = 403,
					message = ex.Message,
					data = new List<object>()
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = "Có lỗi xảy ra: " + ex.Message,
					data = new List<object>()
				});
			}
		}

		[HttpDelete("delete/{questionBankId}")]
		public async Task<IActionResult> DeleteQuestionBank(Guid questionBankId, Guid courseId)
		{
			try
			{
				var accountId = _currentUserService.UserId;
				if (accountId == null)
				{
					return Unauthorized(new APIReturn
					{
						code = 401,
						message = "Bạn cần đăng nhập để thực hiện hành động này.",
						data = new List<object>()
					});
				}
				await _questionBankService.DeleteQuestionBank(questionBankId, accountId.Value, courseId);
				return Ok(new APIReturn
				{
					code = 200,
					message = "Xóa ngân hàng câu hỏi thành công!",
					data = new List<object>()
				});
			}
			catch (UnauthorizedAccessException ex)
			{
				return StatusCode(403, new APIReturn
				{
					code = 403,
					message = ex.Message,
					data = new List<object>()
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = "Có lỗi xảy ra: " + ex.Message,
					data = new List<object>()
				});
			}
		}

		[HttpGet("getBySection/{sectionId}")]
		public async Task<IActionResult> GetQuestionBanksBySectionId(Guid sectionId, Guid courseId)
		{
			try
			{
				var accountId = _currentUserService.UserId;
				if (accountId == null)
				{
					return Unauthorized(new APIReturn
					{
						code = 401,
						message = "Bạn cần đăng nhập để thực hiện hành động này.",
						data = new List<object>()
					});
				}
				var result = await _questionBankService.GetQuestionBanksBySectionIdAsync(sectionId, accountId.Value, courseId);
				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy danh sách ngân hàng câu hỏi thành công!",
					data = new List<object> { result }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = "Có lỗi xảy ra: " + ex.Message,
					data = new List<object>()
				});
			}
		}

		[HttpGet("getById/{questionBankId}")]
		public async Task<IActionResult> GetQuestionBankById(Guid questionBankId, Guid courseId)
		{
			try
			{
				var accountId = _currentUserService.UserId;
				if (accountId == null)
				{
					return Unauthorized(new APIReturn
					{
						code = 401,
						message = "Bạn cần đăng nhập để thực hiện hành động này.",
						data = new List<object>()
					});
				}
				var result = await _questionBankService.GetQuestionBankByIdAsync(questionBankId, accountId.Value, courseId);
				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy thông tin ngân hàng câu hỏi thành công!",
					data = new List<object> { result }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new APIReturn
				{
					code = 500,
					message = "Có lỗi xảy ra: " + ex.Message,
					data = new List<object>()
				});
			}
		}
	}
}
