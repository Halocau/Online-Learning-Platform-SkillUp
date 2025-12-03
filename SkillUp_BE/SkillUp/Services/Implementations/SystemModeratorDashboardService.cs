using SkillUp.BussinessObjects.DTOs.ModDashboard;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
	public class SystemModeratorDashboardService : ISystemModeratorDashboardService
	{
		private readonly ISysModDashRepository _modDashRepository;
		private readonly ICurrentUserService _currentUserService;

		public SystemModeratorDashboardService(ISysModDashRepository modDashRepository, ICurrentUserService currentUserService)
		{
			_modDashRepository = modDashRepository;
			_currentUserService = currentUserService;
		}

		public Task<SysmodDashboardDto> GetSysModDashboardStatisticsAsync()
		{
			if(_currentUserService.RoleId != 2)
			{
				throw new Exception("Bạn không phải System Moderator!");
			}

			var result = _modDashRepository.GetDashboardStatisticsAsync();

			return result;
		}
	}
}
