using SkillUp.BussinessObjects.DTOs.ContentModeration;

namespace SkillUp.Repositories.Interfaces
{
    public interface IModeratorContentRepository
    {
        Task<ModeratorContentDashboardDto> GetDashboardDataAsync();
    }
}

