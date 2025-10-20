using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
	public interface ITicketService
	{
		Task<IEnumerable<Ticket>> GetAllTickets();
		Task<IEnumerable<Ticket>> GetSolvedTickets();
		Task<IEnumerable<Ticket>> GetPendingTickets();
		Task<Ticket> GetTicketById(Guid id);
		Task<Ticket> CreateTicket(Ticket ticket);
		Task<Ticket> UpdateTicket(Ticket ticket);
		Task<Ticket> ResolveTicket(Ticket ticket, bool decision, string response);
	}
}
