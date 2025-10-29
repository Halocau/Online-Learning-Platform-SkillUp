using Microsoft.AspNetCore.Mvc;
using SkillUp.BussinessObjects.DTOs.Ticket;
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
				var ticketsDTO = tickets.Select(t => new TicketViewModDTO
				{
					TicketCode = t.TicketCode,
					Title = t.Title,
					Contents = t.Contents,
					AccountName = t.Account != null ? t.Account.Fullname : "N/A",
					Response = t.Response,
					CreatedAt = t.CreatedAt,
					Status = t.Status
				}).ToList();
				if (tickets == null || !tickets.Any())
				{
					return Ok(new APIReturn
					{
						code = 200,
						message = "Không có ticket nào!",
						data = new List<object>()
					});
				}
				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy ticket thành công!",
					data = new List<object> { ticketsDTO }
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
				var ticketsDTO = tickets.Select(t => new TicketViewModDTO
				{
					TicketCode = t.TicketCode,
					Title = t.Title,
					Contents = t.Contents,
					AccountName = t.Account != null ? t.Account.Fullname : "N/A",
					CreatedAt = t.CreatedAt,
					Status = t.Status
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
					message = "Lấy ticket đã giải quyết thành công!",
					data = new List<object> { ticketsDTO }
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
				var ticketsDTO = tickets.Select(t => new TicketViewModDTO
				{
					TicketCode = t.TicketCode,
					Title = t.Title,
					Contents = t.Contents,
					AccountName = t.Account != null ? t.Account.Fullname : "N/A",
					CreatedAt = t.CreatedAt,
					Status = t.Status
				}).ToList();
				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy ticket chưa giải quyết thành công!",
					data = new List<object> { ticketsDTO }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Có lỗi xảy ra: " + ex.Message });
			}
		}

		[HttpGet("account-tickets/{id}")]
		public async Task<IActionResult> GetTicketsByAccountId(Guid id)
		{
			try
			{
				var tickets = await _ticketService.GetTicketsByAccountId(id);
				if (tickets == null || !tickets.Any())
				{
					return NotFound(new APIReturn
					{
						code = 404,
						message = "Không tìm thấy ticket nào!",
						data = new List<object>()
					});
				}
				var ticketsDTO = tickets.Select(t => new TicketViewUserDTO
				{
					TicketCode = t.TicketCode,
					Title = t.Title,
					Contents = t.Contents,
					CreatedAt = t.CreatedAt,
					Response = t.Response,
					Status = t.Status
				}).ToList();
				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy ticket thành công!",
					data = new List<object> { ticketsDTO }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Có lỗi xảy ra: " + ex.Message });
			}
		}

		[HttpGet("{code}")]
		public async Task<IActionResult> GetTicketByCode(string code)
		{
			try
			{
				var ticket = await _ticketService.GetTicketByCode(code);
				if (ticket == null)
				{
					return NotFound(new APIReturn
					{
						code = 404,
						message = "Không tìm thấy ticket!",
						data = new List<object>()
					});
				}
				var ticketsDTO = new TicketViewModDTO
				{
					TicketCode = ticket.TicketCode,
					Title = ticket.Title,
					Contents = ticket.Contents,
					AccountName = ticket.Account != null ? ticket.Account.Fullname : "N/A",
					CreatedAt = ticket.CreatedAt,
					Response = ticket.Response,
					Status = ticket.Status
				};
				return Ok(new APIReturn
				{
					code = 200,
					message = "Lấy ticket thành công!",
					data = new List<object> { ticketsDTO }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Có lỗi xảy ra: " + ex.Message });
			}
		}

		[HttpPost("create-ticket")]
		public async Task<IActionResult> CreateTicket([FromForm] TicketCreateDTO ticketCreateDTO)
		{
			try
			{
				if (!ModelState.IsValid)
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Dữ liệu không hợp lệ!",
						data = new List<object>()
					});
				}
				var ticket = new Ticket
				{
					Id = Guid.NewGuid(),
					TicketCode = Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper(),
					Title = ticketCreateDTO.Title,
					Contents = ticketCreateDTO.Contents,
					CreatedAt = DateTime.Now,
					Status = "Pending",
					Response = null,
					AccountId = (Guid)_currentUserService.UserId!
				};
				var createdTicket = await _ticketService.CreateTicket(ticket);
				var createdTicketDTO = new TicketViewUserDTO
				{
					TicketCode = createdTicket.TicketCode,
					Title = createdTicket.Title,
					Contents = createdTicket.Contents,
					CreatedAt = createdTicket.CreatedAt,
					Status = createdTicket.Status
				};
				return Ok(new APIReturn
				{
					code = 200,
					message = "Tạo ticket thành công!",
					data = new List<object> { createdTicketDTO }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Có lỗi xảy ra: " + ex.Message });
			}
		}

		[HttpPut("update-ticket")]
		public async Task<IActionResult> UpdateTicket([FromForm] TicketUpdateDTO ticketUpdateDTO)
		{
			try
			{
				if (!ModelState.IsValid)
				{
					return BadRequest(new APIReturn
					{
						code = 400,
						message = "Dữ liệu không hợp lệ!",
						data = new List<object>()
					});
				}
				//var existingTicket = await _ticketService.GetTicketByCode(ticketUpdateDTO.Code);
				Ticket ticket = new Ticket
				{
					TicketCode = ticketUpdateDTO.Code,
					Title = ticketUpdateDTO.Title,
					Contents = ticketUpdateDTO.Contents,
					CreatedAt = DateTime.Now
				};
				var updatedTicket = await _ticketService.UpdateTicket(ticket);
				if (updatedTicket == null)
				{
					return NotFound(new APIReturn
					{
						code = 404,
						message = "Không tìm thấy ticket để cập nhật!",
						data = new List<object>()
					});
				}
				TicketViewModDTO updatedTicketDTO = new TicketViewModDTO
				{
					TicketCode = updatedTicket.TicketCode,
					Title = updatedTicket.Title,
					Contents = updatedTicket.Contents,
					AccountName = updatedTicket.Account != null ? updatedTicket.Account.Fullname : "N/A",
					CreatedAt = updatedTicket.CreatedAt,
					Status = updatedTicket.Status
				};
				return Ok(new APIReturn
				{
					code = 200,
					message = "Cập nhật ticket thành công!",
					data = new List<object> { updatedTicketDTO }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Có lỗi xảy ra: " + ex.Message });
			}
		}

		[HttpPut("resolve-ticket")]
		public async Task<IActionResult> ResolveTicket([FromBody] ResolveTicketDTO resolveTicketDTO)
		{
			try
			{
				var ticket = await _ticketService.GetTicketByCode(resolveTicketDTO.Code);
				if (ticket == null)
				{
					return NotFound(new APIReturn
					{
						code = 404,
						message = "Không tìm thấy ticket!",
						data = new List<object>()
					});
				}
				var resolvedTicket = await _ticketService.ResolveTicket(ticket, resolveTicketDTO.Decision, resolveTicketDTO.Response);

				ResolveTicketDTO resolvedTicketDTO = new ResolveTicketDTO
				{
					Code = resolvedTicket.TicketCode,
					Decision = resolveTicketDTO.Decision,
					Response = resolvedTicket.Response
				};

				return Ok(new APIReturn
				{
					code = 200,
					message = "Giải quyết ticket thành công!",
					data = new List<object> { resolvedTicketDTO }
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Có lỗi xảy ra: " + ex.Message });
			}
		}

        [HttpGet("suggest-titles")]
        public async Task<IActionResult> SuggestTitles(
        [FromQuery] string query, [FromQuery] int limit = 8, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(query))
                return Ok(new { items = Array.Empty<TicketTitleSuggestDto>() });

            var items = await _ticketService.SuggestTitlesAsync(query.Trim(), Math.Clamp(limit, 1, 20), ct);
            return Ok(new { items });
        }
    }
}
