using SkillUp.BussinessObjects.DTOs.LecturerDashboard;

namespace SkillUp.Services.Interfaces
{
    public interface ILecturerDashboardService
    {
         public Task<LecturerDashboardDto> GetLecturerDashboardAsync(Guid accountId);
    }
}
