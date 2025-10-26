using Azure;
using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
	public class TicketRepository : ITicketRepository
	{
		private readonly SkillUpContext _context;
		public TicketRepository(SkillUpContext context)
		{
			_context = context;
		}
		public async Task<IEnumerable<Ticket>> GetAllTickets()
		{
			return await _context.Tickets
				.Include(t => t.Account)
				.ToListAsync();
		}

		public async Task<IEnumerable<Ticket>> GetSolvedTickets()
		{
			return await _context.Tickets
				.Include(t => t.Account)
				.Where(t => t.Status == "Accepted" || t.Status == "Rejected")
				.ToListAsync();
		}

		public async Task<IEnumerable<Ticket>> GetPendingTickets()
		{
			return await _context.Tickets
				.Include(t => t.Account)
				.Where(t => t.Status == "Pending")
				.ToListAsync();
		}

		public async Task<IEnumerable<Ticket>> GetTicketsByAccountId(Guid id)
		{
			return await _context.Tickets
				.Include(t => t.Account)
				.Where(t => t.AccountId == id)
				.ToListAsync();
		}

		public async Task<Ticket> GetTicketByCode(string code)
		{
			return await _context.Tickets.
				Include(t => t.Account).FirstOrDefaultAsync(t => t.TicketCode == code);
		}

		public async Task<Ticket> CreateTicket(Ticket ticket)
		{
			_context.Tickets.Add(ticket);
			await _context.SaveChangesAsync();
			return ticket;
		}
		public async Task<Ticket> UpdateTicket(Ticket ticket)
		{
			_context.Tickets.Update(ticket);
			await _context.SaveChangesAsync();
			return ticket;
		}
	}
}
