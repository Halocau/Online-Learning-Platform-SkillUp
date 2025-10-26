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

        public async Task<Post> CreateAsync(Post post)
        {
            await _context.Posts.AddAsync(post);
            return post;
        }

      public async Task<Post?> GetByIdAsync(Guid id)
{
    return await _context.Posts
        .Include(p => p.Account) // phải có dòng này
        .Include(p => p.ForumCategory)
        .Include(p => p.PostImages)
        .FirstOrDefaultAsync(p => p.Id == id);
}


        public async Task<IEnumerable<Post>> GetAllAsync()
        {
            return await _context.Posts
                .Include(p => p.Account)
                .Include(p => p.ForumCategory)
                .Include(p => p.PostImages)
                .ToListAsync();
        }

        public async Task<IEnumerable<Post>> GetActiveAsync()
        {
            return await _context.Posts
                .Include(p => p.Account)
                .Include(p => p.ForumCategory)
                .Include(p => p.PostImages)
                .Where(p => p.Status == "Active")
                .ToListAsync();
        }

        public async Task<IEnumerable<Post>> GetByUserAsync(Guid userId, bool includeInactive)
        {
            var query = _context.Posts
                .Include(p => p.Account)
                .Include(p => p.ForumCategory)
                .Include(p => p.PostImages)
                .Where(p => p.AccountId == userId);

            if (!includeInactive)
                query = query.Where(p => p.Status == "Active");

            return await query.ToListAsync();
        }

        public async Task UpdateAsync(Post post)
        {
            _context.Posts.Update(post);
            await Task.CompletedTask;
        }

        public async Task DeleteAsync(Post post)
        {
            _context.Posts.Remove(post);
            await Task.CompletedTask;
        }

        public async Task SaveAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
