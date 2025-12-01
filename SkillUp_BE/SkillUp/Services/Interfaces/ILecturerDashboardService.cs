using SkillUp.BussinessObjects.DTOs.LecturerDashboard;
using SkillUp.BussinessObjects.DTOs.RevenueReport;

namespace SkillUp.Services.Interfaces
{
    public interface ILecturerDashboardService
    {
         public Task<LecturerDashboardDto> GetLecturerDashboardAsync(Guid accountId);
        public Task<RevenueReportDto> GetRevenueReportAsync(Guid accountId, int? year, Guid? courseId);
    }
}
