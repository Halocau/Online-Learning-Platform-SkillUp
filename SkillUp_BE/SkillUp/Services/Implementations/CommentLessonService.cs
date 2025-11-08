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

        public CommentLessonService(
            ICommentLessonRepository repo,
            ILikeCommentLessonRepository likeRepo)
        {
            _repo = repo;
            _likeRepo = likeRepo;
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
            var newComment = new CommentLesson
            {
                Id = Guid.NewGuid(),
                LessonId = dto.LessonId,
                AccountId = accountId,
                Contents = dto.Contents,
                ParentCommentId = dto.ParentCommentId,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now, // <-- THÊM VÀO ĐÂY (ĐÚNG)
                IsActive = true
            };

            var savedComment = await _repo.CreateAsync(newComment);

            // DTO này không có UpdatedAt, nên XÓA NÓ ĐI
            return new CommentLessonDto
            {
                Id = savedComment.Id,
                LessonId = savedComment.LessonId,
                Contents = savedComment.Contents,
                CreatedAt = savedComment.CreatedAt,
                // UpdatedAt = DateTime.Now, // <-- XÓA DÒNG NÀY
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