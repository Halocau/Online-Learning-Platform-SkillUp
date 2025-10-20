using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.Models;
using SkillUp.ExceptionHandling;
using SkillUp.Services.Interfaces;

namespace SkillUp.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class TicketController : ControllerBase
	{
		private readonly ITicketService _ticketService;
		private readonly ICurrentUserService _currentUserService;
		public TicketController(ITicketService ticketService, ICurrentUserService currentUserService)
		{
			_ticketService = ticketService;
			_currentUserService = currentUserService;
		}

		[HttpGet("all-tickets")]
		public async Task<IActionResult> GetAllTickets()
		{
			try
			{
				var tickets = await _ticketService.GetAllTickets();
				var ticketsDTO = tickets.Select(t => new
				{
					Id = t.Id,
					t.Title,
					t.Contents,
					t.Status,
					t.Response,
					t.CreatedAt,
					AccountEmail = t.Account != null ? t.Account.Email : null
				}).ToList();
				if (tickets == null || !tickets.Any())
				{
					return NotFound(new APIReturn
					{
						code = 404,
						message = "Không tìm thấy ticket nào!",
						data = new List<object>()
					});
				}
				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy ticket thành công!",
					data = new List<object> { tickets }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Có lỗi xảy ra: " + ex.Message });
			}
		}

		[HttpGet("solved-tickets")]
		public async Task<IActionResult> GetSolvedTickets()
		{
			try
			{
				var tickets = await _ticketService.GetSolvedTickets();
				if (tickets == null || !tickets.Any())
				{
					return NotFound(new APIReturn
					{
						code = 404,
						message = "Không tìm thấy ticket nào!",
						data = new List<object>()
					});
				}
				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy ticket đã giải quyết thành công!",
					data = new List<object> { tickets }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Có lỗi xảy ra: " + ex.Message });
			}
		}

		[HttpGet("unsolved-tickets")]
		public async Task<IActionResult> GetUnsolvedTickets()
		{
			try
			{
				var tickets = await _ticketService.GetPendingTickets();
				if (tickets == null || !tickets.Any())
				{
					return NotFound(new APIReturn
					{
						code = 404,
						message = "Không tìm thấy ticket nào!",
						data = new List<object>()
					});
				}
				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy ticket chưa giải quyết thành công!",
					data = new List<object> { tickets }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Có lỗi xảy ra: " + ex.Message });
			}
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> GetTicketById(Guid id)
		{
			try
			{
				var ticket = await _ticketService.GetTicketById(id);
				if (ticket == null)
				{
					return NotFound(new APIReturn
					{
						code = 404,
						message = "Không tìm thấy ticket!",
						data = new List<object>()
					});
				}
				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy ticket thành công!",
					data = new List<object> { ticket }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Có lỗi xảy ra: " + ex.Message });
			}
		}

		[HttpPost("create-ticket")]
		public async Task<IActionResult> CreateTicket([FromForm] Ticket ticket)
		{
			try
			{
				var createdTicket = await _ticketService.CreateTicket(ticket);
				return Ok(new APIReturn
				{
					code = 200,
					message = "Tạo ticket thành công!",
					data = new List<object> { createdTicket }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Có lỗi xảy ra: " + ex.Message });
			}
		}

		[HttpPut("update-ticket")]
		public async Task<IActionResult> UpdateTicket([FromForm] Ticket ticket)
		{
			try
			{
				var updatedTicket = await _ticketService.UpdateTicket(ticket);
				return Ok(new APIReturn
				{
					code = 200,
					message = "Cập nhật ticket thành công!",
					data = new List<object> { updatedTicket }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Có lỗi xảy ra: " + ex.Message });
			}
		}

		[HttpPut("resolve-ticket")]
		public async Task<IActionResult> ResolveTicket([FromForm] Guid id, [FromForm] bool decision, [FromForm] string response)
		{
			try
			{
				var ticket = await _ticketService.GetTicketById(id);
				if (ticket == null)
				{
					return NotFound(new APIReturn
					{
						code = 404,
						message = "Không tìm thấy ticket!",
						data = new List<object>()
					});
				}
				var resolvedTicket = await _ticketService.ResolveTicket(ticket, decision, response);
				return Ok(new APIReturn
				{
					code = 200,
					message = "Giải quyết ticket thành công!",
					data = new List<object> { resolvedTicket }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Có lỗi xảy ra: " + ex.Message });
			}
		}
	}
}
