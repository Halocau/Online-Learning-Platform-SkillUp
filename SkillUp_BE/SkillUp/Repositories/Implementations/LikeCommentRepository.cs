using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.DTOs.Common;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using System;
using System.Threading.Tasks;

namespace SkillUp.Repositories.Implementations
{
    public class LikeCommentPostRepository : ILikeCommentPostRepository
    {
        private readonly SkillUp1Context _context;

        public LikeCommentPostRepository(SkillUp1Context context)
        {
            _context = context;
        }

        public async Task<LikeCommentPost?> GetByAccountAndCommentAsync(Guid accountId, Guid commentPostId)
        {
            return await _context.LikeCommentPosts
                .FirstOrDefaultAsync(x => x.AccountId == accountId && x.CommentPostId == commentPostId);
        }

        public async Task<LikeInteractionResult> AddOrToggleLikeAsync(Guid accountId, Guid commentPostId)
        {
            bool isFirstLike = false; // Cờ (flag) mới
            var like = await GetByAccountAndCommentAsync(accountId, commentPostId);

            if (like == null)
            {
                // Đây là lần đầu tiên, tạo mới
                isFirstLike = true;
                like = new LikeCommentPost
                {
                    AccountId = accountId,
                    CommentPostId = commentPostId,
                    Status = true // Lần đầu luôn là "Like"
                };
                _context.LikeCommentPosts.Add(like);
            }
            else
            {
                // Đã có, chỉ toggle
                // isFirstLike vẫn là false
                like.Status = !like.Status;
                _context.LikeCommentPosts.Update(like);
            }

            await _context.SaveChangesAsync();

            // Trả về đối tượng kết quả
            return new LikeInteractionResult
            {
                Like = like,
                IsFirstLike = isFirstLike
            };
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