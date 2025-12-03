using SkillUp.BussinessObjects.DTOs.ContentModeration;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class ModeratorContentService : IModeratorContentService
    {
        private readonly IModeratorContentRepository _moderatorContentRepository;

        public ModeratorContentService(IModeratorContentRepository moderatorContentRepository)
        {
            _moderatorContentRepository = moderatorContentRepository;
        }

        public async Task<ModeratorContentDashboardDto> GetDashboardAsync()
        {
            // Repository sẽ xử lý tất cả queries tuần tự để tránh xung đột DbContext
            return await _moderatorContentRepository.GetDashboardDataAsync();
        }
    }
}

