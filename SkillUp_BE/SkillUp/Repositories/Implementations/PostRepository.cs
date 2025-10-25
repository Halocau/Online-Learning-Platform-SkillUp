// Repositories/Implementations/PostRepository.cs
using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class PostRepository : IPostRepository
    {
        private readonly SkillUpContext _context;
        public PostRepository(SkillUpContext context) => _context = context;

        public async Task<Post> CreateAsync(Post post)
        {
            _context.Posts.Add(post);
            await _context.SaveChangesAsync();
            return post;
        }

        public async Task<List<Post>> GetAllAsync()
        {
            return await _context.Posts
                .Include(p => p.Account)
                .Include(p => p.ForumCategory)
                .Include(p => p.CommentPosts)
                .Include(p => p.PostImages)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Post>> GetActiveAsync()
        {
            return await _context.Posts
                .Where(p => p.Status == "Active")
                .Include(p => p.Account)
                .Include(p => p.ForumCategory)
                .Include(p => p.CommentPosts)
                .Include(p => p.PostImages)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Post>> GetByAccountIdAsync(Guid accountId, bool includeInactive)
        {
            var query = _context.Posts
                .Include(p => p.ForumCategory)
                .Include(p => p.CommentPosts)
                .Include(p => p.PostImages)
                .Where(p => p.AccountId == accountId);

            if (!includeInactive)
                query = query.Where(p => p.Status == "Active");

            return await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
        }

        public async Task<Post?> GetByIdAsync(Guid id)
        {
            return await _context.Posts
                .Include(p => p.ForumCategory)
                .Include(p => p.PostImages)
                .FirstOrDefaultAsync(p => p.Id == id);
        }
    }
}
