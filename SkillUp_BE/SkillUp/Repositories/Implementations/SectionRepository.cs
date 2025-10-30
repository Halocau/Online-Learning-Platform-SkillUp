using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class SectionRepository : ISectionRepository
    {
        private readonly SkillUpContext _context;

        public SectionRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<Section?> GetSectionByIdAsync(Guid id)
        {
            return await _context.Sections.Include(s => s.Course).FirstOrDefaultAsync(s => s.Id == id);
        }
    }
}
