using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class CommentPostRepository : ICommentPostRepository
    {
        private readonly SkillUp1Context _context;

        public CommentPostRepository(SkillUp1Context context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CommentPost>> GetCommentsByPostIdAsync(Guid postId)
        {
            return await _context.CommentPosts
                .Include(c => c.Account)
                 .Where(c => c.PostId == postId && c.IsActive)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<CommentPost> CreateAsync(CommentPost comment)
        {
            _context.CommentPosts.Add(comment);
            await _context.SaveChangesAsync();

            // Load Account để có fullname khi trả về
            await _context.Entry(comment).Reference(c => c.Account).LoadAsync();

            return comment;
        }

        public async Task<CommentPost?> GetByIdAsync(Guid commentId)
        {
            return await _context.CommentPosts
                .Include(c => c.Account)
                .FirstOrDefaultAsync(c => c.Id == commentId);
        }

        public async Task UpdateAsync(CommentPost comment)
        {
            _context.CommentPosts.Update(comment);
            await _context.SaveChangesAsync();
            await _context.Entry(comment).Reference(c => c.Account).LoadAsync();
        }

    }
}
