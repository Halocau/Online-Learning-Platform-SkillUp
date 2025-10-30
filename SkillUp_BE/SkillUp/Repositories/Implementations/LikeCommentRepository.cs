using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using System;
using System.Threading.Tasks;

namespace SkillUp.Repositories.Implementations
{
    public class LikeCommentPostRepository : ILikeCommentPostRepository
    {
        private readonly SkillUpContext _context;

        public LikeCommentPostRepository(SkillUpContext context)
        {
            _context = context;
        }

        public async Task<LikeCommentPost?> GetByAccountAndCommentAsync(Guid accountId, Guid commentPostId)
        {
            return await _context.LikeCommentPosts
                .FirstOrDefaultAsync(x => x.AccountId == accountId && x.CommentPostId == commentPostId);
        }

        public async Task<LikeCommentPost> AddOrToggleLikeAsync(Guid accountId, Guid commentPostId)
        {
            var like = await GetByAccountAndCommentAsync(accountId, commentPostId);
            if (like == null)
            {
                like = new LikeCommentPost
                {
                    AccountId = accountId,
                    CommentPostId = commentPostId,
                    Status = true
                };
                _context.LikeCommentPosts.Add(like);
            }
            else
            {
                like.Status = !like.Status;
                _context.LikeCommentPosts.Update(like);
            }

            await _context.SaveChangesAsync();
            return like;
        }

        public async Task<int> CountLikesAsync(Guid commentPostId)
        {
            return await _context.LikeCommentPosts.CountAsync(x => x.CommentPostId == commentPostId && x.Status);
        }
    }
}
