using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
	public interface ITicketService
	{
		Task<IEnumerable<Ticket>> GetAllTickets();
		Task<IEnumerable<Ticket>> GetSolvedTickets();
		Task<IEnumerable<Ticket>> GetPendingTickets();
		Task<IEnumerable<Ticket>> GetTicketsByAccountId(Guid id);
		Task<Ticket> GetTicketByCode(string code);
		Task<Ticket> CreateTicket(Ticket ticket);
		Task<Ticket> UpdateTicket(Ticket ticket);
		Task<Ticket> ResolveTicket(Ticket ticket, bool decision, string response);
	}
}
