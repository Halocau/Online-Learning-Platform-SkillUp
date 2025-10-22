using SkillUp.Services.Interfaces;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

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
			return await _ticketRepository.UpdateTicket(ticket);
		}
		public async Task<Ticket> ResolveTicket(Ticket ticket, bool decision, string response)
		{
			return await _ticketRepository.ResolveTicket(ticket, decision, response);
		}
	}
}
