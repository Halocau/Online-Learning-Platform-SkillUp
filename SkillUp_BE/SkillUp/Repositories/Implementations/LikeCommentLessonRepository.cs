// File: /Repositories/Implementations/LikeCommentLessonRepository.cs
// (Dựa trên logic của CommentPostService)
using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Repositories.Implementations
{
    public class LikeCommentLessonRepository : ILikeCommentLessonRepository
    {
        private readonly SkillUpContext _context;
        public LikeCommentLessonRepository(SkillUpContext context) { _context = context; }

        public async Task<int> CountLikesAsync(Guid commentId)
        {
            return await _context.LikeCommentLessons // Đổi
                .CountAsync(l => l.CommentLessonId == commentId && l.Status == true); // Đổi
        }

        public async Task<Dictionary<Guid, int>> GetLikeCountsForCommentListAsync(List<Guid> commentIds)
        {
            if (commentIds == null || !commentIds.Any())
                return new Dictionary<Guid, int>();

            return await _context.LikeCommentLessons // Đổi
                .Where(l => l.Status == true && commentIds.Contains(l.CommentLessonId)) // Đổi
                .GroupBy(l => l.CommentLessonId) // Đổi
                .Select(g => new { CommentId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.CommentId, x => x.Count);
        }
    }
}