using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class SectionRepository : ISectionRepository
    {
        private readonly SkillUp1Context _context;

        public SectionRepository(SkillUp1Context context)
        {
            _context = context;
        }

        public async Task<Section?> GetSectionByIdAsync(Guid id)
        {
            return await _context.Sections.Include(s => s.Course).FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Section> CreateAsync(Section section)
        {
            await _context.Sections.AddAsync(section);
            await _context.SaveChangesAsync();
            return section;
        }
        public async Task<Section?> GetByIdAsync(Guid id)
        {
            // Tìm section, chỉ bao gồm section còn Active
            return await _context.Sections
                .FirstOrDefaultAsync(s => s.Id == id && s.IsActive);
        }

        public async Task<IEnumerable<Section>> GetByCourseIdAsync(Guid courseId)
        {
            // Lấy tất cả sections (còn Active) của một Course
            return await _context.Sections
                .Where(s => s.CourseId == courseId && s.IsActive)
                .OrderBy(s => s.CreatedAt) // Sắp xếp theo ngày tạo
                .ToListAsync();
        }

        public async Task<Section> UpdateAsync(Section section)
        {
            _context.Sections.Update(section);
            await _context.SaveChangesAsync();
            return section;
        }

        public async Task<Section?> FindByIdAsync(Guid id)
        {
            // Tìm section, BẤT KỂ trạng thái (dùng cho admin/manage)
            return await _context.Sections
                .FirstOrDefaultAsync(s => s.Id == id);
        }

		public async Task<List<Section>> GetSectionsByIdsAndCourseAsync(IEnumerable<Guid> ids, Guid courseId)
		{
			return await _context.Sections
				.Where(s => s.CourseId == courseId && ids.Contains(s.Id))
				.ToListAsync();
		}
	}
}