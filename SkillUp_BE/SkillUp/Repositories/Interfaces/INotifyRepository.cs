using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface INotifyRepository
    {
        Task<Notify> CreateAsync(Notify notification);
    }
}