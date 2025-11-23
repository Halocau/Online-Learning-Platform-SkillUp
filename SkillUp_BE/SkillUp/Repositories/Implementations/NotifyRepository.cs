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
        public async Task<Notify?> GetByIdAsync(Guid id)
        {
            return await _context.Notifies.FindAsync(id);
        }

        public async Task UpdateAsync(Notify notification)
        {
            _context.Notifies.Update(notification);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Notify>> GetUnreadByAccountIdAsync(Guid accountId)
        {
            // Lấy các thông báo của user mà Status là "Unread"
            return await _context.Notifies
                .Where(n => n.AccountId == accountId && n.Status == "Unread")
                .ToListAsync();
        }

        public async Task UpdateRangeAsync(IEnumerable<Notify> notifications)
        {
            _context.Notifies.UpdateRange(notifications);
            await _context.SaveChangesAsync();
        }

    }
    }
