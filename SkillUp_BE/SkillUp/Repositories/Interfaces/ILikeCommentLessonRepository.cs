// File: /Repositories/Interfaces/ILikeCommentLessonRepository.cs
// (Dựa trên logic của CommentPostService)
namespace SkillUp.Repositories.Interfaces
{
    public interface ILikeCommentLessonRepository
    {
        Task<int> CountLikesAsync(Guid commentId);
        Task<Dictionary<Guid, int>> GetLikeCountsForCommentListAsync(List<Guid> commentIds);
    }
}