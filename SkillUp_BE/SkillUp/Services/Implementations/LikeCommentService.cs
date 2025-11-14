using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using System;
using System.Threading.Tasks;

namespace SkillUp.Services.Implementations
{
    public class LikeCommentPostService : ILikeCommentPostService
    {
        private readonly ILikeCommentPostRepository _likeRepo;
        private readonly ICommentPostRepository _commentPostRepo;
        private readonly IAccountRepository _accountRepo;
        private readonly INotifyService _notifyService;

        public LikeCommentPostService(
              ILikeCommentPostRepository likeRepo,
              ICommentPostRepository commentPostRepo, // Tham số mới
              IAccountRepository accountRepo,         // Tham số mới
              INotifyService notifyService)         // Tham số mới
        {
            _likeRepo = likeRepo;
            _commentPostRepo = commentPostRepo;
            _accountRepo = accountRepo;
            _notifyService = notifyService;
        }

        public async Task<int> LikeOrUnlikeCommentAsync(Guid accountId, Guid commentPostId)
        {
            // 1. Thực hiện Like/Unlike (Hàm này giờ trả về LikeInteractionResult)
            var result = await _likeRepo.AddOrToggleLikeAsync(accountId, commentPostId);

            // 2. LOGIC THÔNG BÁO (SỬA LẠI)
            // Chỉ thông báo NẾU:
            // (a) Trạng thái là "Like" (true)
            // (b) VÀ đây là LẦN ĐẦU TIÊN (IsFirstLike == true)
            if (result.Like.Status == true && result.IsFirstLike == true)
            {
                try
                {
                    var comment = await _commentPostRepo.GetByIdAsync(commentPostId);
                    if (comment != null && comment.AccountId != accountId)
                    {
                        var liker = await _accountRepo.GetByIdAsync(accountId);
                        var likerName = liker?.Fullname ?? "Một người dùng";

                        await _notifyService.CreateNotificationAsync(
                            comment.AccountId,
                            "Lượt thích mới",
                            $"{likerName} đã thích bình luận của bạn."
                        );
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Lỗi gửi thông báo (Like): {ex.Message}");
                }
            }

            // 3. Trả về tổng số like
            return await _likeRepo.CountLikesAsync(commentPostId);
        }

        public async Task<int> CountLikesAsync(Guid commentPostId)
        {
            return await _likeRepo.CountLikesAsync(commentPostId);
        }
    
}
}
