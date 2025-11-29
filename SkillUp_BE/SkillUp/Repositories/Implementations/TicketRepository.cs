using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
	public class TicketRepository : ITicketRepository
	{
		private readonly SkillUpContext _context;
        private const string CI_AI = "SQL_Latin1_General_CP1_CI_AI";// case-insensitive + accent-insensitive
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

        public async Task<IReadOnlyList<Ticket>> SuggestTitleEntitiesAsync(
             string query, int limit, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(query))
                return Array.Empty<Ticket>(); // OK vì method là async

            query = query.Trim();
            limit = Math.Clamp(limit, 1, 20);

            var q = _context.Tickets
                .AsNoTracking()
                .Where(t => t.Title != null)
                .Select(t => new
                {
                    t,
                    TitleAI = EF.Functions.Collate(t.Title!, CI_AI),
                })
                .Select(x => new
                {
                    x.t,
                    Prefix = EF.Functions.Like(x.TitleAI, query + "%"),
                    Substr = EF.Functions.Like(x.TitleAI, "%" + query + "%")
                })
                .Where(x => x.Prefix || x.Substr)
                .OrderByDescending(x => x.Prefix)     // ưu tiên khớp tiền tố
                .ThenBy(x => x.t.Title!.Length)       // tiêu đề ngắn ưu tiên
                .Select(x => x.t)
                .Take(limit);

            var list = await q.ToListAsync(ct);
            return list; // List<Ticket> implements IReadOnlyList<Ticket>
        }
    }
}
