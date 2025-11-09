// File: /Services/Interfaces/ICommentReportLessonService.cs
using SkillUp.BussinessObjects.DTOs.Comment;

namespace SkillUp.Services.Interfaces
{
    public interface ICommentReportLessonService
    {
        Task<CommentReportLessonDto> CreateReportAsync(CreateCommentReportLessonDto dto, Guid reporterAccountId);
        Task<IEnumerable<CommentReportLessonDto>> GetPendingReportsAsync();
        Task<CommentReportLessonDto> UpdateReportStatusAsync(UpdateCommentReportStatusDto dto);
    }
}