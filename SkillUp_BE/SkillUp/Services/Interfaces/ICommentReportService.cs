using SkillUp.BussinessObjects.DTOs.Comment; 
using System;
using System.Threading.Tasks;

namespace SkillUp.Services.Interfaces
{
    public interface ICommentReportService
    {
        Task<CommentReportDto> CreateReportAsync(CreateCommentReportDto dto, Guid accountId);
    }
}