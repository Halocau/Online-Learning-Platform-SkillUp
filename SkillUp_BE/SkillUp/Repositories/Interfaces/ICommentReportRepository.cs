using SkillUp.BussinessObjects.Models;
using System;
using System.Threading.Tasks;

namespace SkillUp.Repositories.Interfaces
{
    public interface ICommentReportRepository
    {
        Task<CommentReportPost> CreateAsync(CommentReportPost report);

        // Kiểm tra xem user này đã report comment này chưa
        Task<bool> HasAlreadyReportedAsync(Guid accountId, Guid commentPostId);
        Task<CommentReportPost?> GetByIdAsync(Guid reportId);
        Task UpdateAsync(CommentReportPost report);
    }
}