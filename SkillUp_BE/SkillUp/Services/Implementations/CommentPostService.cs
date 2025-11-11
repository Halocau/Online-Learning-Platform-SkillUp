// --- File: SkillUp.Services/Implementations/CommentPostService.cs ---
// --- HÃY DÙNG CODE NÀY ĐỂ THAY THẾ ---

using SkillUp.BussinessObjects.DTOs.Comment;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces; // <-- THÊM
using SkillUp.Services.Interfaces;
using System;
using System.Collections.Generic; // <-- THÊM
using System.Linq; // <-- THÊM
using System.Threading.Tasks;

namespace SkillUp.Services.Implementations
{
    public class CommentPostService : ICommentPostService
    {
        private readonly ICommentPostRepository _repo;
        private readonly ILikeCommentPostRepository _likeRepo; // <-- DÒNG MỚI
        private readonly IPostRepository _postRepo;
        private readonly INotifyService _notifyService;
        private readonly IAccountRepository _accountRepo;

        // --- SỬA CONSTRUCTOR ---
        public CommentPostService(
            ICommentPostRepository repo,
            ILikeCommentPostRepository likeRepo,
            IPostRepository postRepo, // Tham số mới
            INotifyService notifyService, // Tham số mới
            IAccountRepository accountRepo)
        {
            _repo = repo;
            _likeRepo = likeRepo; // <-- DÒNG MỚI
            _postRepo = postRepo; // Mới
            _notifyService = notifyService; // Mới
            _accountRepo = accountRepo; // Mới
        }

        // --- HÀM BỊ SAI HIỆN TẠI (GETBYPOST) ---
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

            // 3. (PHẦN BỊ THIẾU) Gọi hàm tối ưu để lấy TẤT CẢ like count trong 1 truy vấn
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

                // Lấy giá trị từ dictionary, nếu không có thì mặc định là 0
                LikeCount = likeCounts.GetValueOrDefault(c.Id, 0) // <-- SỬA Ở ĐÂY
            });
        }

        // --- CÁC HÀM KHÁC (Cũng cần cập nhật để trả về LikeCount) ---

        public async Task<CommentPostDto> CreateCommentAsync(CreateCommentDto dto, Guid accountId)
        {
            // 1. Tạo Comment (Logic cũ)
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

            // Lấy tên người comment (thay vì dùng savedComment.Account)
            var commenter = await _accountRepo.GetByIdAsync(accountId);
            var accountName = commenter?.Fullname ?? "Một người dùng";

            // 2. LOGIC MỚI: GỬI THÔNG BÁO
            try
            {
                var post = await _postRepo.GetByIdAsync(dto.PostId);

                // Chỉ gửi nếu: 1. Tìm thấy post, 2. Người comment KHÔNG PHẢI là chủ post
                if (post != null && post.AccountId != accountId)
                {
                    await _notifyService.CreateNotificationAsync(
                        post.AccountId, // Gửi đến chủ post
                        "Bình luận mới",
                        $"{accountName} đã bình luận bài viết của bạn."
                    );
                }
            }
            catch (Exception ex)
            {
                // Bỏ qua lỗi thông báo để không làm hỏng chức năng comment
                Console.WriteLine($"Lỗi gửi thông báo: {ex.Message}");
            }

            // 3. Trả về DTO (Logic cũ)
            return new CommentPostDto
            {
                Id = savedComment.Id,
                PostId = savedComment.PostId,
                Contents = savedComment.Contents,
                CreatedAt = savedComment.CreatedAt,
                AccountId = savedComment.AccountId,
                AccountName = accountName, // Dùng tên vừa lấy
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

            // Đếm like
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