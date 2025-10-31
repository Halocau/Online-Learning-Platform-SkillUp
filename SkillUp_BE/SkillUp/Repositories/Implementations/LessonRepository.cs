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
            return await _context.Lessons.Include(l => l.Section).ToListAsync();
        }

        public async Task<Lesson> GetLessonByIdAsync(Guid id)
        {
            return await _context.Lessons.Include(l => l.Section)
                                         .FirstOrDefaultAsync(l => l.Id == id);
        }
        public async Task<IEnumerable<Lesson>> GetActiveLessonsAsync()
        {
            return await _context.Lessons.Where(l => l.IsActive).ToListAsync();
        }
        public async Task<Lesson> CreateLessonAsync(Lesson lesson)
        {
            _context.Lessons.Add(lesson);
            await _context.SaveChangesAsync();
            return lesson;
        }

        public async Task<Lesson> UpdateLessonAsync(Lesson lesson)
        {
            _context.Lessons.Update(lesson);
            await _context.SaveChangesAsync();
            return lesson;
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
