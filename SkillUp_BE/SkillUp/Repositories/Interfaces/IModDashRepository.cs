using SkillUp.BussinessObjects.DTOs.ModDashboard;

namespace SkillUp.Repositories.Interfaces
{
	public interface IModDashRepository
	{
		Task<SysmodDashboardDto> GetDashboardStatisticsAsync();
	}
}
