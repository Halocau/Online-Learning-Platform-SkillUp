using SkillUp.BussinessObjects.Models;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace SkillUp.Repositories.Interfaces
{
    public interface IReportPostRepository
    {
        Task<ReportPost> CreateAsync(ReportPost reportPost);
        Task<ReportPost?> GetByIdAsync(Guid id);
        Task<ReportPost?> GetExistingReportAsync(Guid postId, Guid accountId);
        Task<IEnumerable<ReportPost>> GetAllPendingReportsAsync();
        Task UpdateAsync(ReportPost reportPost);
    }
}