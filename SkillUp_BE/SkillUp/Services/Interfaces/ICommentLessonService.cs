// File: /Services/Interfaces/ICommentLessonService.cs
// (Giống ICommentPostService)
using SkillUp.BussinessObjects.DTOs.Comment;

namespace SkillUp.Services.Interfaces
{
    public interface ICommentLessonService
    {
        Task<IEnumerable<CommentLessonDto>> GetCommentsByLessonIdAsync(Guid lessonId);
        Task<CommentLessonDto> CreateCommentAsync(CreateCommentLessonDto dto, Guid accountId);
        Task<CommentLessonDto> UpdateCommentAsync(UpdateCommentLessonDto dto, Guid accountId);
        Task<CommentLessonDto> DeleteCommentAsync(Guid commentId, Guid accountId);
    }
}