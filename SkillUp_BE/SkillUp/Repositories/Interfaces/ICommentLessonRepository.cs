// File: /Repositories/Interfaces/ICommentLessonRepository.cs
// (Giống ICommentPostRepository)
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ICommentLessonRepository
    {
        Task<CommentLesson> CreateAsync(CommentLesson comment);
        Task<CommentLesson?> GetByIdAsync(Guid commentId);
        Task UpdateAsync(CommentLesson comment);
        Task<IEnumerable<CommentLesson>> GetCommentsByLessonIdAsync(Guid lessonId);
    }
}