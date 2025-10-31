using SkillUp.BussinessObjects.DTOs.Comment;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class CommentPostService : ICommentPostService
    {
        private readonly ICommentPostRepository _repo;

        public CommentPostService(ICommentPostRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<CommentPostDto>> GetCommentsByPostIdAsync(Guid postId)
        {
            var comments = await _repo.GetCommentsByPostIdAsync(postId);
            return comments.Select(c => new CommentPostDto
            {
                Id = c.Id,
                PostId = c.PostId,
                Contents = c.Contents,
                CreatedAt = c.CreatedAt,
                AccountId = c.AccountId,
                AccountName = c.Account?.Fullname ?? "",
                ParentCommentId = c.ParentCommentId

            });
        }

        public async Task<CommentPostDto> CreateCommentAsync(CreateCommentDto dto, Guid accountId)
        {
            var newComment = new CommentPost
            {
                Id = Guid.NewGuid(),
                PostId = dto.PostId,
                AccountId = accountId,
                Contents = dto.Contents,
                ParentCommentId = dto.ParentCommentId,
                CreatedAt = DateTime.UtcNow,
                  IsActive = true
            };

            var savedComment = await _repo.CreateAsync(newComment);

            return new CommentPostDto
            {
                Id = savedComment.Id,
                PostId = savedComment.PostId,
                Contents = savedComment.Contents,
                CreatedAt = savedComment.CreatedAt,
                AccountId = savedComment.AccountId,
                AccountName = savedComment.Account?.Fullname ?? "",
                ParentCommentId = savedComment.ParentCommentId,
                 IsActive = true
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
            comment.UpdatedAt = DateTime.UtcNow;

            await _repo.UpdateAsync(comment);

            return new CommentPostDto
            {
                Id = comment.Id,
                PostId = comment.PostId,
                Contents = comment.Contents,
                CreatedAt = comment.CreatedAt,
                AccountId = comment.AccountId,
                AccountName = comment.Account.Fullname,
                ParentCommentId = comment.ParentCommentId,
                  IsActive = true
            };
        }
        public async Task<CommentPostDto> DeleteCommentAsync(Guid commentId, Guid accountId)
        {
            var comment = await _repo.GetByIdAsync(commentId);
            if (comment == null)
                throw new Exception("Không tìm thấy comment.");

            // Thêm logic kiểm tra quyền (ví dụ: chỉ chủ comment hoặc admin mới được xóa)
            if (comment.AccountId != accountId)
                throw new UnauthorizedAccessException("Bạn không có quyền xóa comment này.");

            comment.IsActive = false;
            comment.UpdatedAt = DateTime.UtcNow;

            await _repo.UpdateAsync(comment);

            return new CommentPostDto
            {
                Id = comment.Id,
                PostId = comment.PostId,
                Contents = comment.Contents,
                CreatedAt = comment.CreatedAt,
                AccountId = comment.AccountId,
                AccountName = comment.Account?.Fullname ?? "",
                ParentCommentId = comment.ParentCommentId,
                IsActive = comment.IsActive // Sẽ là false
            };
        }

    }
}
