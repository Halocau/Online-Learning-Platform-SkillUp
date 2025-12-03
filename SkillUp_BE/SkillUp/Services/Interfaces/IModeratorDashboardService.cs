using SkillUp.BussinessObjects.DTOs.ModDashboard;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Services.Interfaces
{
	public interface IModeratorDashboardService
	{
		Task<SysmodDashboardDto> GetSysModDashboardStatisticsAsync();
	}
}
