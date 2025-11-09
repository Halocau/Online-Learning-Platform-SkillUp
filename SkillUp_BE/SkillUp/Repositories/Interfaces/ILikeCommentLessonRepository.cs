// File: /Repositories/Interfaces/ILikeCommentLessonRepository.cs
// (Thêm các hàm mới)

using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ILikeCommentLessonRepository
    {
        Task<int> CountLikesAsync(Guid commentId);
        Task<Dictionary<Guid, int>> GetLikeCountsForCommentListAsync(List<Guid> commentIds);

        // --- HÀM MỚI ---
        // Tìm 1 record like cụ thể
        Task<LikeCommentLesson?> GetLikeStatusAsync(Guid commentLessonId, Guid accountId);
        // Tạo mới 1 record like
        Task<LikeCommentLesson> CreateLikeAsync(LikeCommentLesson like);
        // Cập nhật 1 record like
        Task UpdateLikeAsync(LikeCommentLesson like);
        Task<Dictionary<Guid, bool>> GetLikeStatusesForCommentListAsync(List<Guid> commentIds, Guid accountId);
    }
}