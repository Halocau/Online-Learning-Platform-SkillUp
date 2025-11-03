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
        public async Task<Dictionary<Guid, int>> GetLikeCountsForCommentListAsync(IEnumerable<Guid> commentPostIds)
        {
            if (commentPostIds == null || !commentPostIds.Any())
            {
                return new Dictionary<Guid, int>();
            }

            // Tối ưu: Lấy tất cả like count trong 1 truy vấn
            return await _context.LikeCommentPosts
                // 1. Lọc theo danh sách comment ID VÀ chỉ những like có Status = true
                .Where(l => commentPostIds.Contains(l.CommentPostId) && l.Status)
                // 2. Nhóm theo CommentPostId
                .GroupBy(l => l.CommentPostId)
                // 3. Tạo đối tượng mới (CommentId, Số lượng like)
                .Select(g => new { CommentId = g.Key, Count = g.Count() })
                // 4. Chuyển thành Dictionary để tra cứu nhanh
                .ToDictionaryAsync(x => x.CommentId, x => x.Count);
        }
    }
}