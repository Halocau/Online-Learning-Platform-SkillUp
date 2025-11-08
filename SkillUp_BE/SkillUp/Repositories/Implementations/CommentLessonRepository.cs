// File: /Repositories/Implementations/CommentLessonRepository.cs
// (Giống CommentPostRepository)
using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class CommentLessonRepository : ICommentLessonRepository
    {
        private readonly SkillUpContext _context;

        public CommentLessonRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CommentLesson>> GetCommentsByLessonIdAsync(Guid lessonId)
        {
            return await _context.CommentLessons // Đổi
                .Include(c => c.Account)
                .Where(c => c.LessonId == lessonId && c.IsActive) // Đổi
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<CommentLesson> CreateAsync(CommentLesson comment)
        {
            _context.CommentLessons.Add(comment); // Đổi
            await _context.SaveChangesAsync();

            await _context.Entry(comment).Reference(c => c.Account).LoadAsync();
            return comment;
        }

        public async Task<CommentLesson?> GetByIdAsync(Guid commentId)
        {
            return await _context.CommentLessons // Đổi
                .Include(c => c.Account)
                .FirstOrDefaultAsync(c => c.Id == commentId);
        }

        public async Task UpdateAsync(CommentLesson comment)
        {
            _context.CommentLessons.Update(comment); // Đổi
            await _context.SaveChangesAsync();
            await _context.Entry(comment).Reference(c => c.Account).LoadAsync();
        }
    }
}