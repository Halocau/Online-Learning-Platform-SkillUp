using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class PostRepository : IPostRepository
    {
        private readonly SkillUpContext _context;
        public PostRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<Post?> GetByIdAsync(Guid id)
        {
            return await _context.Posts
                .Include(p => p.Account)
                .Include(p => p.ForumCategory)
                .Include(p => p.PostImages)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task AddAsync(Post post) => await _context.Posts.AddAsync(post);

        public async Task UpdateAsync(Post post)
        {
            _context.Posts.Update(post);
            await Task.CompletedTask;
        }

        public async Task<List<Post>> GetAllAsync()
        {
            return await _context.Posts
                .Include(p => p.Account)
                .Include(p => p.ForumCategory)
                .Include(p => p.CommentPosts)
                .Include(p => p.PostImages)
                .ToListAsync();
        }

        public async Task<List<Post>> GetActiveAsync()
        {
            return await _context.Posts
                .Where(p => p.Status == "Active")
                .Include(p => p.Account)
                .Include(p => p.ForumCategory)
                .Include(p => p.PostImages)
                .ToListAsync();
        }

        public async Task<List<Post>> GetByUserIdAsync(Guid accountId, bool includeInactive)
        {
            var query = _context.Posts.Where(p => p.AccountId == accountId);
            if (!includeInactive)
                query = query.Where(p => p.Status == "Active");

            return await query
                .Include(p => p.ForumCategory)
                .Include(p => p.PostImages)
                .ToListAsync();
        }

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }
}
