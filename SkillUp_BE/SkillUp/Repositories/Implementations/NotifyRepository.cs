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
    }
}