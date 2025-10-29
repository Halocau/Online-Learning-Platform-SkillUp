using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
	public interface ITicketRepository
	{
		Task<IEnumerable<Ticket>> GetAllTickets();
		Task<IEnumerable<Ticket>> GetSolvedTickets();
		Task<IEnumerable<Ticket>> GetPendingTickets();
		Task<IEnumerable<Ticket>> GetTicketsByAccountId(Guid id);
		Task<Ticket> GetTicketByCode(string code);
		Task<Ticket> CreateTicket(Ticket ticket);
		Task<Ticket> UpdateTicket(Ticket ticket);
        Task<IReadOnlyList<Ticket>> SuggestTitleEntitiesAsync(
        string query, int limit, CancellationToken ct = default);
    }
}
