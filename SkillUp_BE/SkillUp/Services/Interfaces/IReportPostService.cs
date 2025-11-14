using SkillUp.BussinessObjects.DTOs.ReportPost;
using System;
using System.Threading.Tasks;

namespace SkillUp.Services.Interfaces
{
    public interface IReportPostService
    {
        Task<ReportPostDto> CreateReportPostAsync(CreateReportPostDto dto, Guid reporterAccountId);
        Task<IEnumerable<ReportPostDto>> GetAllPendingReportsAsync();
        Task<ReportPostDto> ProcessReportAsync(Guid reportId, ProcessReportDto dto);
    }
}