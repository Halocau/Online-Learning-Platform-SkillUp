// File: /Services/Implementations/CommentLessonService.cs
// (Giống CommentPostService)
using SkillUp.BussinessObjects.DTOs.Comment;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using System.Linq;

namespace SkillUp.Services.Implementations
{
    public class CommentLessonService : ICommentLessonService
    {
        private readonly ICommentLessonRepository _repo;
        private readonly ILikeCommentLessonRepository _likeRepo;
        private readonly ILessonRepository _lessonRepo;
        private readonly IAccountRepository _accountRepo;
        private readonly INotifyService _notifyService;

        public CommentLessonService(
             ICommentLessonRepository repo,
             ILikeCommentLessonRepository likeRepo,
             ILessonRepository lessonRepo,
             IAccountRepository accountRepo,
             INotifyService notifyService)
        {
            _repo = repo;
            _likeRepo = likeRepo;
            _lessonRepo = lessonRepo;
            _accountRepo = accountRepo;
            _notifyService = notifyService;
        }

        public async Task<IEnumerable<CommentLessonDto>> GetCommentsByLessonIdAsync(Guid lessonId)
        {
            var comments = await _repo.GetCommentsByLessonIdAsync(lessonId);

            if (comments == null || !comments.Any())
                return Enumerable.Empty<CommentLessonDto>();

            var commentIds = comments.Select(c => c.Id).ToList();

            var likeCounts = new Dictionary<Guid, int>();
            if (commentIds.Any())
                likeCounts = await _likeRepo.GetLikeCountsForCommentListAsync(commentIds);

            // Mapping thủ công y hệt code mẫu
            return comments.Select(c => new CommentLessonDto
            {
                Id = c.Id,
                LessonId = c.LessonId, // Đổi
                Contents = c.Contents,
                CreatedAt = c.CreatedAt,
                AccountId = c.AccountId,
                AccountName = c.Account?.Fullname ?? "",
                ParentCommentId = c.ParentCommentId,
                IsActive = c.IsActive,
                LikeCount = likeCounts.GetValueOrDefault(c.Id, 0)
            });
        }

        public async Task<CommentLessonDto> CreateCommentAsync(CreateCommentLessonDto dto, Guid accountId)
        {
            // 1. Tạo Comment (Logic cũ)
            var newComment = new CommentLesson
            {
                // ... (Id, LessonId, AccountId, ...)
                Id = Guid.NewGuid(),
                LessonId = dto.LessonId,
                AccountId = accountId,
                Contents = dto.Contents,
                ParentCommentId = dto.ParentCommentId,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                IsActive = true
            };

            var savedComment = await _repo.CreateAsync(newComment);

            var commenter = await _accountRepo.GetByIdAsync(accountId);
            var accountName = commenter?.Fullname ?? "Một người dùng";

            // 2. LOGIC THÔNG BÁO (CẬP NHẬT CATCH BLOCK)
            try
            {
                var lesson = await _lessonRepo.GetByIdAsync(dto.LessonId);

                CommentLesson? parentComment = null;
                if (dto.ParentCommentId.HasValue)
                {
                    parentComment = await _repo.GetByIdAsync(dto.ParentCommentId.Value);
                }

                // 2.1. Thông báo cho Chủ Bài Giảng (Giảng viên)
                if (lesson == null)
                    throw new Exception("Không tìm thấy Lesson.");
                if (lesson.Section == null)
                    throw new Exception("Lesson không có Section.");
                if (lesson.Section.Course == null)
                    throw new Exception("Section không có Course.");
                if (lesson.Section.Course.Lecturer == null)
                    throw new Exception("Course không có Lecturer.");
                if (lesson.Section.Course.Lecturer.AccountId == null) // Giả định AccountId có trong Lecturer
                    throw new Exception("Lecturer không có AccountId.");

                // Nếu tất cả đều qua, mới gửi thông báo
                var lecturerAccountId = lesson.Section.Course.Lecturer.AccountId;
                if (lecturerAccountId != accountId)
                {
                    await _notifyService.CreateNotificationAsync(
                        lecturerAccountId,
                        "Bình luận bài giảng mới",
                        $"{accountName} đã bình luận bài giảng của bạn."
                    );
                }

                // 2.2. Thông báo cho Chủ Comment Bị Trả Lời
                if (parentComment != null && parentComment.AccountId != accountId)
                {
                    await _notifyService.CreateNotificationAsync(
                        parentComment.AccountId,
                        "Trả lời bình luận",
                        $"{accountName} đã trả lời bình luận của bạn."
                    );
                }
            }
            catch (Exception ex)
            {
                // --- ĐÂY LÀ PHẦN SỬA QUAN TRỌNG ---
                // Chúng ta in ra lỗi chi tiết hơn
                Console.WriteLine("--- LỖI GỬI THÔNG BÁO (LESSON) ---");
                Console.WriteLine(ex.Message); // In ra "Không tìm thấy Lesson", "Lesson không có Section", v.v...
                Console.WriteLine(ex.StackTrace);
                // --- HẾT PHẦN SỬA ---
            }

            // 3. Trả về DTO (Logic cũ)
            return new CommentLessonDto
            {
                // ... (Id, LessonId, Contents, ...)
                Id = savedComment.Id,
                LessonId = savedComment.LessonId,
                Contents = savedComment.Contents,
                CreatedAt = savedComment.CreatedAt,
                AccountId = savedComment.AccountId,
                AccountName = accountName,
                ParentCommentId = savedComment.ParentCommentId,
                IsActive = true,
                LikeCount = 0
            };
        }

        public async Task<CommentLessonDto> UpdateCommentAsync(UpdateCommentLessonDto dto, Guid accountId)
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

            return new CommentLessonDto
            {
                Id = comment.Id,
                LessonId = comment.LessonId, // Đổi
                Contents = comment.Contents,
                CreatedAt = comment.CreatedAt,
                AccountId = comment.AccountId,
                AccountName = comment.Account?.Fullname ?? "",
                ParentCommentId = comment.ParentCommentId,
                IsActive = comment.IsActive,
                LikeCount = likeCount
            };
        }

        public async Task<CommentLessonDto> DeleteCommentAsync(Guid commentId, Guid accountId)
        {
            var comment = await _repo.GetByIdAsync(commentId);
            if (comment == null)
                throw new Exception("Không tìm thấy comment.");

            if (comment.AccountId != accountId)
                throw new UnauthorizedAccessException("Bạn không có quyền xóa comment này.");

            comment.IsActive = false; // Soft delete
            comment.UpdatedAt = DateTime.Now;

            await _repo.UpdateAsync(comment);

            var likeCount = await _likeRepo.CountLikesAsync(comment.Id);

            return new CommentLessonDto
            {
                Id = comment.Id,
                LessonId = comment.LessonId, // Đổi
                Contents = comment.Contents,
                CreatedAt = comment.CreatedAt,
                AccountId = comment.AccountId,
                AccountName = comment.Account?.Fullname ?? "",
                ParentCommentId = comment.ParentCommentId,
                IsActive = comment.IsActive,
                LikeCount = likeCount
            };
        }
    }
}