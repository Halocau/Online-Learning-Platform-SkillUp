using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class LessonRepository : ILessonRepository
    {
        private readonly SkillUpContext _context;
        public LessonRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Lesson>> GetAllLessonsAsync()
        {
            return await _context.Lessons
                .Include(l => l.Section)
                .OrderBy(l => l.LessonOrder)
                .ToListAsync();
        }

        public async Task<Lesson?> GetLessonByIdAsync(Guid id)
        {
            return await _context.Lessons
                .Include(l => l.Section)
                .Include(l => l.Assets)
                .FirstOrDefaultAsync(l => l.Id == id);
        }

        public async Task<Lesson?> GetLessonWithDetailsAsync(Guid id)
        {
            return await _context.Lessons
                .Include(l => l.Section)
                .Include(l => l.Assets)
                .FirstOrDefaultAsync(l => l.Id == id);
        }

        public async Task<IEnumerable<Lesson>> GetLessonsBySectionIdAsync(Guid sectionId)
        {
            return await _context.Lessons
                .Where(l => l.SectionId == sectionId)
                .Include(l => l.Assets)
                .OrderBy(l => l.LessonOrder)
                .ToListAsync();
        }

        public async Task<IEnumerable<Lesson>> GetActiveLessonsAsync()
        {
            return await _context.Lessons
                .Where(l => l.IsActive)
                .Include(l => l.Section)
                .OrderBy(l => l.LessonOrder)
                .ToListAsync();
        }

        public async Task AddLessonAsync(Lesson lesson)
        {
            await _context.Lessons.AddAsync(lesson);
        }

        public void UpdateLesson(Lesson lesson)
        {
            _context.Lessons.Update(lesson);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteLessonAsync(Guid id)
        {
            var lesson = await _context.Lessons.FindAsync(id);
            if (lesson == null)
                return false;

            lesson.IsActive = false;
            _context.Lessons.Update(lesson);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
