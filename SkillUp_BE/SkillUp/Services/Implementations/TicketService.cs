using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.DTOs.Ticket;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
	public class TicketService : ITicketService
	{
		private readonly ITicketRepository _ticketRepository;
		public TicketService(ITicketRepository ticketRepository)
		{
			_ticketRepository = ticketRepository;
		}
		public async Task<IEnumerable<Ticket>> GetAllTickets()
		{
			return await _ticketRepository.GetAllTickets();
		}
		public async Task<IEnumerable<Ticket>> GetSolvedTickets()
		{
			return await _ticketRepository.GetSolvedTickets();
		}
		public async Task<IEnumerable<Ticket>> GetPendingTickets()
		{
			return await _ticketRepository.GetPendingTickets();
		}
		public async Task<IEnumerable<Ticket>> GetTicketsByAccountId(Guid accountId)
		{
			return await _ticketRepository.GetTicketsByAccountId(accountId);
		}
		public async Task<Ticket> GetTicketByCode(string code)
		{
			return await _ticketRepository.GetTicketByCode(code);
		}
		public async Task<Ticket> CreateTicket(Ticket ticket)
		{
			return await _ticketRepository.CreateTicket(ticket);
		}
		public async Task<Ticket> UpdateTicket(Ticket ticket)
		{
			var existingTicket = await _ticketRepository.GetTicketByCode(ticket.TicketCode);
			if (existingTicket == null)
			{
				return null;
			}
			existingTicket.Title = ticket.Title;
			existingTicket.Contents = ticket.Contents;
			existingTicket.CreatedAt = ticket.CreatedAt;

			return await _ticketRepository.UpdateTicket(existingTicket);
		}
		public async Task<Ticket> ResolveTicket(Ticket ticket, bool decision, string response)
		{
			var existingTicket = await _ticketRepository.GetTicketByCode(ticket.TicketCode);
			if (existingTicket == null)
			{
				return null;
			}

			existingTicket.Status = decision ? "Accepted" : "Rejected";
			existingTicket.Response = response;

			await _ticketRepository.UpdateTicket(existingTicket);

			return existingTicket;
		}

        public async Task<IReadOnlyList<TicketTitleSuggestDto>> SuggestTitlesAsync(string query, int limit, CancellationToken ct = default)
        {
            var entities = await _ticketRepository.SuggestTitleEntitiesAsync(query, limit, ct);

            // Score đơn giản để debug/hiển thị: prefix > substring
            return entities.Select(t =>
            {
                var title = t.Title ?? string.Empty;
                var idx = title.IndexOf(query, StringComparison.OrdinalIgnoreCase);
                var score = idx == 0 ? 1.0 : (idx > 0 ? 0.7 : 0.0);
                return new TicketTitleSuggestDto
				{
					Id = t.Id,
					Title = title,
					Score = score
                };
            }).ToList();
        }
    }
}
