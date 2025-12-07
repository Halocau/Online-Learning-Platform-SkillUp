
using SkillUp.BussinessObjects.DTOs.Comment;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using System;
using System.Collections.Generic; 
using System.Linq; 
using System.Threading.Tasks;

namespace SkillUp.Services.Implementations
{
    public class CommentPostService : ICommentPostService
    {
        private readonly ICommentPostRepository _repo;
        private readonly ILikeCommentPostRepository _likeRepo; 
        private readonly IPostRepository _postRepo;
        private readonly INotifyService _notifyService;
        private readonly IAccountRepository _accountRepo;

        // --- SỬA CONSTRUCTOR ---
        public CommentPostService(
            ICommentPostRepository repo,
            ILikeCommentPostRepository likeRepo,
            IPostRepository postRepo, 
            INotifyService notifyService, 
            IAccountRepository accountRepo)
        {
            _repo = repo;
            _likeRepo = likeRepo; 
            _postRepo = postRepo; 
            _notifyService = notifyService;  
            _accountRepo = accountRepo; 
        }

      
        public async Task<IEnumerable<CommentPostDto>> GetCommentsByPostIdAsync(Guid postId)
        {
            // 1. Lấy danh sách comment
            var comments = await _repo.GetCommentsByPostIdAsync(postId);

            if (comments == null || !comments.Any())
            {
                return Enumerable.Empty<CommentPostDto>();
            }

            // 2. Lấy danh sách ID của các comment
            var commentIds = comments.Select(c => c.Id).ToList();

            // 3.    Gọi hàm tối ưu để lấy TẤT CẢ like count trong 1 truy vấn
            var likeCounts = new Dictionary<Guid, int>();
            if (commentIds.Any())
            {
                likeCounts = await _likeRepo.GetLikeCountsForCommentListAsync(commentIds);
            }

            // 4. Map kết quả (thêm LikeCount)
            return comments.Select(c => new CommentPostDto
            {
                Id = c.Id,
                PostId = c.PostId,
                Contents = c.Contents,
                CreatedAt = c.CreatedAt,
                AccountId = c.AccountId,
                AccountName = c.Account?.Fullname ?? "",
                ParentCommentId = c.ParentCommentId,
                IsActive = c.IsActive,
                LikeCount = likeCounts.GetValueOrDefault(c.Id, 0) 
            });
        }



        //public async Task<CommentPostDto> CreateCommentAsync(CreateCommentDto dto, Guid accountId)
        //{
        //    // 1. Tạo Comment (Logic cũ của bạn)
        //    var newComment = new CommentPost
        //    {
        //        Id = Guid.NewGuid(),
        //        PostId = dto.PostId,
        //        AccountId = accountId,
        //        Contents = dto.Contents,
        //        ParentCommentId = dto.ParentCommentId, // Đây là ID của comment cha
        //        CreatedAt = DateTime.Now,
        //        IsActive = true
        //    };

        //    var savedComment = await _repo.CreateAsync(newComment);

        //    var commenter = await _accountRepo.GetByIdAsync(accountId);
        //    var accountName = commenter?.Fullname ?? "Một người dùng";


        //    try
        //    {

        //        var post = await _postRepo.GetByIdAsync(dto.PostId);


        //        CommentPost? parentComment = null;
        //        if (dto.ParentCommentId.HasValue)
        //        {

        //            parentComment = await _repo.GetByIdAsync(dto.ParentCommentId.Value);
        //        }
        //        // ----------------------------------------


        //        if (post != null && post.AccountId != accountId)
        //        {
        //            await _notifyService.CreateNotificationAsync(
        //                post.AccountId,
        //                "Bình luận mới",
        //                $"{accountName} đã bình luận bài viết của bạn."
        //            );
        //        }


        //        if (parentComment != null &&
        //            parentComment.AccountId != accountId &&
        //            (post == null || parentComment.AccountId != post.AccountId))
        //        {
        //            await _notifyService.CreateNotificationAsync(
        //                parentComment.AccountId, 
        //                "Trả lời bình luận",
        //                $"{accountName} đã trả lời bình luận của bạn."
        //            );
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"Lỗi gửi thông báo: {ex.Message}");
        //    }


        //    return new CommentPostDto
        //    {
        //        Id = savedComment.Id,
        //        PostId = savedComment.PostId,
        //        Contents = savedComment.Contents,
        //        CreatedAt = savedComment.CreatedAt,
        //        AccountId = savedComment.AccountId,
        //        AccountName = accountName,
        //        ParentCommentId = savedComment.ParentCommentId,
        //        IsActive = true,
        //        LikeCount = 0
        //    };
        //}

        public async Task<CommentPostDto> CreateCommentAsync(CreateCommentDto dto, Guid accountId)
        {
            // 1. Tạo Comment
            var newComment = new CommentPost
            {
                Id = Guid.NewGuid(),
                PostId = dto.PostId,
                AccountId = accountId,
                Contents = dto.Contents,
                ParentCommentId = dto.ParentCommentId,
                CreatedAt = DateTime.Now,
                IsActive = true
            };

            var savedComment = await _repo.CreateAsync(newComment);

            var commenter = await _accountRepo.GetByIdAsync(accountId);
            var accountName = commenter?.Fullname ?? "Một người dùng";

            // 2. Gửi thông báo (NOTIFICATION)
            try
            {
                var post = await _postRepo.GetByIdAsync(dto.PostId);

            
                string targetLink = $"/forum/{dto.PostId}";

                CommentPost? parentComment = null;
                if (dto.ParentCommentId.HasValue)
                {
                    parentComment = await _repo.GetByIdAsync(dto.ParentCommentId.Value);
                }

                // A. Thông báo cho chủ bài viết (nếu người comment không phải chủ bài viết)
                if (post != null && post.AccountId != accountId)
                {
                    await _notifyService.CreateNotificationAsync(
                        post.AccountId,
                        "Bình luận mới",
                        $"{accountName} đã bình luận bài viết của bạn.",
                        targetLink 
                    );
                }

                // B. Thông báo cho người được trả lời (nếu trả lời comment của người khác)
                if (parentComment != null &&
                    parentComment.AccountId != accountId &&
                    (post == null || parentComment.AccountId != post.AccountId)) // Tránh spam 2 thông báo nếu chủ bài viết cũng là người cmt
                {
                    await _notifyService.CreateNotificationAsync(
                        parentComment.AccountId,
                        "Trả lời bình luận",
                        $"{accountName} đã trả lời bình luận của bạn.",
                        targetLink // <--- TRUYỀN LINK VÀO ĐÂY
                    );
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Lỗi gửi thông báo: {ex.Message}");
            }

            return new CommentPostDto
            {
                Id = savedComment.Id,
                PostId = savedComment.PostId,
                Contents = savedComment.Contents,
                CreatedAt = savedComment.CreatedAt,
                AccountId = savedComment.AccountId,
                AccountName = accountName,
                ParentCommentId = savedComment.ParentCommentId,
                IsActive = true,
                LikeCount = 0
            };
        }
        public async Task<CommentPostDto> UpdateCommentAsync(UpdateCommentDto dto, Guid accountId)
        {
            var comment = await _repo.GetByIdAsync(dto.CommentId);
            if (comment == null)
                throw new Exception("Không tìm thấy comment.");

            if (comment.AccountId != accountId)
                throw new UnauthorizedAccessException("Bạn không có quyền chỉnh sửa comment này.");

            comment.Contents = dto.Contents;
            comment.UpdatedAt = DateTime.Now;

            await _repo.UpdateAsync(comment);

           
            var likeCount = await _likeRepo.CountLikesAsync(comment.Id);

            return new CommentPostDto
            {
                Id = comment.Id,
                PostId = comment.PostId,
                Contents = comment.Contents,
                CreatedAt = comment.CreatedAt,
                AccountId = comment.AccountId,
                AccountName = comment.Account?.Fullname ?? "", // Sửa: Thêm ?? ""
                ParentCommentId = comment.ParentCommentId,
                IsActive = comment.IsActive, // Sửa: Dùng comment.IsActive
                LikeCount = likeCount // Trả về like count
            };
        }

        public async Task<CommentPostDto> DeleteCommentAsync(Guid commentId, Guid accountId)
        {
            var comment = await _repo.GetByIdAsync(commentId);
            if (comment == null)
                throw new Exception("Không tìm thấy comment.");

            if (comment.AccountId != accountId)
                throw new UnauthorizedAccessException("Bạn không có quyền xóa comment này.");

            comment.IsActive = false;
            comment.UpdatedAt = DateTime.Now;

            await _repo.UpdateAsync(comment);

            // Vẫn đếm like
            var likeCount = await _likeRepo.CountLikesAsync(comment.Id);

            return new CommentPostDto
            {
                Id = comment.Id,
                PostId = comment.PostId,
                Contents = comment.Contents,
                CreatedAt = comment.CreatedAt,
                AccountId = comment.AccountId,
                AccountName = comment.Account?.Fullname ?? "",
                ParentCommentId = comment.ParentCommentId,
                IsActive = comment.IsActive,
                LikeCount = likeCount // Trả về like count
            };
        }
    }
}