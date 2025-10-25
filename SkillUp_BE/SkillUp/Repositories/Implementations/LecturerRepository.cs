using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class LecturerRepository : ILecturerRepository
    {
        private readonly SkillUpContext _context;

        public LecturerRepository(SkillUpContext context)
        {
            _context = context;
        }
        public async Task<Lecturer?> GetLecturerByAccountIdAsync(Guid accountId)
        {
            return await _context.Lecturers
                 .FirstOrDefaultAsync(l => l.AccountId == accountId);
        }
    }
}
