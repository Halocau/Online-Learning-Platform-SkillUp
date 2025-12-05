using SkillUp.BussinessObjects.DTOs.ModDashboard;

namespace SkillUp.Repositories.Interfaces
{
	public interface ISysModDashRepository
	{
		Task<SysmodDashboardDto> GetDashboardStatisticsAsync();
	}
}
