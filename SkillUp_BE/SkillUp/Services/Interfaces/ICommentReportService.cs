using SkillUp.BussinessObjects.DTOs.Comment; 
using System;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace SkillUp.Services.Interfaces
{
    public interface ICommentReportService
    {
        Task<CommentReportDto> CreateReportAsync(CreateCommentReportDto dto, Guid accountId);
        Task<CommentReportDto> ResolveReportAsync(ResolveCommentReportDto dto);
        Task<IEnumerable<CommentReportDto>> GetAllReportsAsync();

        Task<IEnumerable<CommentReportDto>> GetPendingReportsAsync();
    }
}