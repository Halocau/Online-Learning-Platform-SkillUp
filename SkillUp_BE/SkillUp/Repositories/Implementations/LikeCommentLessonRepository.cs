// File: /Repositories/Implementations/LikeCommentLessonRepository.cs
// (Thêm các hàm mới)

using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class LikeCommentLessonRepository : ILikeCommentLessonRepository
    {
        private readonly SkillUp1Context _context;
        public LikeCommentLessonRepository(SkillUp1Context context) { _context = context; }

        public async Task<int> CountLikesAsync(Guid commentId)
        {
            return await _context.LikeCommentLessons
                .CountAsync(l => l.CommentLessonId == commentId && l.Status == true);
        }

        public async Task<Dictionary<Guid, int>> GetLikeCountsForCommentListAsync(List<Guid> commentIds)
        {
            if (commentIds == null || !commentIds.Any())
                return new Dictionary<Guid, int>();

            return await _context.LikeCommentLessons
                .Where(l => l.Status == true && commentIds.Contains(l.CommentLessonId))
                .GroupBy(l => l.CommentLessonId)
                .Select(g => new { CommentId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.CommentId, x => x.Count);
        }

        // --- HÀM MỚI ---

        public async Task<LikeCommentLesson?> GetLikeStatusAsync(Guid commentLessonId, Guid accountId)
        {
            return await _context.LikeCommentLessons
                .FirstOrDefaultAsync(l => l.CommentLessonId == commentLessonId && l.AccountId == accountId);
        }

        public async Task<LikeCommentLesson> CreateLikeAsync(LikeCommentLesson like)
        {
            _context.LikeCommentLessons.Add(like);
            await _context.SaveChangesAsync();
            return like;
        }

        public async Task UpdateLikeAsync(LikeCommentLesson like)
        {
            _context.LikeCommentLessons.Update(like);
            await _context.SaveChangesAsync();
        }

       
            public async Task<Dictionary<Guid, bool>> GetLikeStatusesForCommentListAsync(List<Guid> commentIds, Guid accountId)
            {
                if (commentIds == null || !commentIds.Any())
                    return new Dictionary<Guid, bool>();

                // Lấy tất cả record "like" của user này 
                // mà nằm trong danh sách commentIds
                return await _context.LikeCommentLessons
                    .Where(l => l.AccountId == accountId && commentIds.Contains(l.CommentLessonId))
                    .ToDictionaryAsync(l => l.CommentLessonId, l => l.Status);
            }
        
    }
}