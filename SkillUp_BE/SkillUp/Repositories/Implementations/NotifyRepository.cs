using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class NotifyRepository : INotifyRepository
    {
        private readonly SkillUpContext _context;

        public NotifyRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<Notify> CreateAsync(Notify notification)
        {
            _context.Notifies.Add(notification);
            await _context.SaveChangesAsync();
            return notification;
        }

        public async Task<IEnumerable<Notify>> GetByAccountIdAsync(Guid accountId)
        {
            return await _context.Notifies
                .Where(n => n.AccountId == accountId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Notify>> GetAllAsync()
        {
            return await _context.Notifies
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();
        }
    }
}
