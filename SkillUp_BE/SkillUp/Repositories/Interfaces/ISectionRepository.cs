using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ISectionRepository
    {
        Task<Section?> GetSectionByIdAsync(Guid id);
    }
}
