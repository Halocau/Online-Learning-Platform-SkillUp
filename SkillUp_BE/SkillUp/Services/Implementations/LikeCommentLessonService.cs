// File: /Services/Implementations/LikeCommentLessonService.cs

using SkillUp.BussinessObjects.DTOs.Like;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class LikeCommentLessonService : ILikeCommentLessonService
    {
        private readonly ILikeCommentLessonRepository _likeRepo;
        private readonly ICommentLessonRepository _commentRepo;

        public LikeCommentLessonService(ILikeCommentLessonRepository likeRepo , ICommentLessonRepository commentRepo)
        {
            _likeRepo = likeRepo;
            _commentRepo = commentRepo;
        }

        public async Task<LikeCommentLessonResponseDto> ToggleLikeAsync(Guid commentLessonId, Guid accountId)
        {
            // 1. Kiểm tra xem user đã like comment này chưa
            var existingLike = await _likeRepo.GetLikeStatusAsync(commentLessonId, accountId);

            bool newStatus = true;

            if (existingLike == null)
            {
                // 1A. Nếu CHƯA có -> Tạo mới (Status = true)
                await _likeRepo.CreateLikeAsync(new LikeCommentLesson
                {
                    CommentLessonId = commentLessonId,
                    AccountId = accountId,
                    Status = true
                });
                newStatus = true;
            }
            else
            {
                // 1B. Nếu ĐÃ có -> Đảo ngược status (true -> false, false -> true)
                existingLike.Status = !existingLike.Status;
                newStatus = existingLike.Status;
                await _likeRepo.UpdateLikeAsync(existingLike);
            }

            // 2. Đếm lại tổng số like (chỉ đếm những record có Status = true)
            var totalLikes = await _likeRepo.CountLikesAsync(commentLessonId);

            // 3. Trả về kết quả
            return new LikeCommentLessonResponseDto
            {
                CommentLessonId = commentLessonId,
                LikeCount = totalLikes,
                UserLikedStatus = newStatus
            };
        }

        public async Task<IEnumerable<LikeCommentLessonResponseDto>> GetLikeStatusesForLessonAsync(Guid lessonId, Guid? accountId)
        {
            // 1. Lấy tất cả comment (active) của bài học
            var comments = await _commentRepo.GetCommentsByLessonIdAsync(lessonId);
            if (comments == null || !comments.Any())
                return Enumerable.Empty<LikeCommentLessonResponseDto>();

            var commentIds = comments.Select(c => c.Id).ToList();

            // 2. Lấy TỔNG SỐ like (tối ưu 1 lần gọi)
            var likeCounts = await _likeRepo.GetLikeCountsForCommentListAsync(commentIds);

            // 3. Lấy TRẠNG THÁI like CỦA USER (tối ưu 1 lần gọi)
            var userStatuses = new Dictionary<Guid, bool>();
            if (accountId.HasValue && accountId.Value != Guid.Empty)
            {
                userStatuses = await _likeRepo.GetLikeStatusesForCommentListAsync(commentIds, accountId.Value);
            }

            // 4. Kết hợp kết quả
            return comments.Select(c => new LikeCommentLessonResponseDto
            {
                CommentLessonId = c.Id,
                LikeCount = likeCounts.GetValueOrDefault(c.Id, 0),
                UserLikedStatus = userStatuses.GetValueOrDefault(c.Id, false)
            });
        }

        public async Task<LikeCommentLessonResponseDto> GetLikeStatusForCommentAsync(Guid commentLessonId, Guid? accountId)
        {
            // 1. Đếm tổng số like (chỉ đếm status = true)
            // (Hàm này đã có trong ILikeCommentLessonRepository)
            int totalLikes = await _likeRepo.CountLikesAsync(commentLessonId);

            // 2. Lấy trạng thái like của user hiện tại
            bool userLiked = false;
            if (accountId.HasValue && accountId.Value != Guid.Empty)
            {
                // (Hàm này đã có trong ILikeCommentLessonRepository)
                var likeStatus = await _likeRepo.GetLikeStatusAsync(commentLessonId, accountId.Value);

                // Nếu likeStatus tồn tại VÀ status = true thì userLiked = true
                if (likeStatus != null && likeStatus.Status == true)
                {
                    userLiked = true;
                }
            }

            // 3. Trả về kết quả
            return new LikeCommentLessonResponseDto
            {
                CommentLessonId = commentLessonId,
                LikeCount = totalLikes,
                UserLikedStatus = userLiked
            };
        }
    }
}