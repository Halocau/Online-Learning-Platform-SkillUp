using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class LecturerApplicationRepository : ILecturerApplicationRepository
    {
        private readonly SkillUpContext _context;

        public LecturerApplicationRepository(SkillUpContext context)
        {
            _context = context;
        }


        public async Task<LecturerApplication> GetByIdAsync(Guid id)
        {
            return await _context.LecturerApplications
                .Include(x => x.Account)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<LecturerApplication> GetByAccountIdAsync(Guid accountId)
        {
            return await _context.LecturerApplications
                .Include(x => x.Account)
                .FirstOrDefaultAsync(x => x.AccountId == accountId);
        }

        public async Task<LecturerApplication> GetLatestByAccountIdAsync(Guid accountId)
        {
            return await _context.LecturerApplications
                .Include(x => x.Account)
                .Where(x => x.AccountId == accountId)
                .OrderByDescending(x => x.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<List<LecturerApplication>> GetAllByAccountIdAsync(Guid accountId)
        {
            return await _context.LecturerApplications
                .Where(x => x.AccountId == accountId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<LecturerApplication>> GetAllAsync()
        {
            return await _context.LecturerApplications
                .Include(x => x.Account)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<LecturerApplication>> GetByStatusAsync(string status)
        {
            return await _context.LecturerApplications
                .Include(x => x.Account)
                .Where(x => x.Status == status)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<LecturerApplication> AddAsync(LecturerApplication application)
        {
            _context.LecturerApplications.Add(application);
            return application;
        }

        public async Task<LecturerApplication> UpdateAsync(LecturerApplication application)
        {
            _context.Entry(application).State = EntityState.Modified;
            return application;
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var application = await _context.LecturerApplications.FindAsync(id);
            if (application == null)
                return false;

            _context.LecturerApplications.Remove(application);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsByAccountIdAsync(Guid accountId)
        {
            return await _context.LecturerApplications
                .AnyAsync(x => x.AccountId == accountId);
        }

        public async Task<List<LecturerApplication>> GetAllLecturerApplicationsAsync()
        {
            var applications = await _context.LecturerApplications.ToListAsync();
            return applications ?? new List<LecturerApplication>();
        }

        public async Task<LecturerApplication> UpdateStatusAsync(Guid applicationId, bool status, string reason)
        {
            var application = await _context.LecturerApplications.FindAsync(applicationId);
            if (application == null)
                return null;

            application.Status = status ? "Accepted" : "Rejected";
            application.Reason = reason;
            _context.Entry(application).State = EntityState.Modified;
            return application;
        }
    }
}