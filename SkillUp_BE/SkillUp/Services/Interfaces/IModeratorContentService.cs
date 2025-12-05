using SkillUp.BussinessObjects.DTOs.ContentModeration;

namespace SkillUp.Services.Interfaces
{
    public interface IModeratorContentService
    {
        Task<ModeratorContentDashboardDto> GetDashboardAsync();
    }
}

