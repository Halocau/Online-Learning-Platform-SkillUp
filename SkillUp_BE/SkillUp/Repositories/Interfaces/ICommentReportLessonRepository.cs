// File: /Repositories/Interfaces/ICommentReportLessonRepository.cs
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ICommentReportLessonRepository
    {
        Task<CommentReportLesson> CreateAsync(CommentReportLesson report);
        Task<CommentReportLesson?> GetByIdAsync(Guid reportId);
        Task<IEnumerable<CommentReportLesson>> GetPendingReportsAsync();
        Task UpdateAsync(CommentReportLesson report);
    }
}