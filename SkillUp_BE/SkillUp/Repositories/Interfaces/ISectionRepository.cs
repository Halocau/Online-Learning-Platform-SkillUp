using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ISectionRepository
    {
        Task<Section?> GetSectionByIdAsync(Guid id);

        Task<Section> CreateAsync(Section section);
        Task<Section?> GetByIdAsync(Guid id);
        Task<IEnumerable<Section>> GetByCourseIdAsync(Guid courseId); // Lấy DS section theo Course
        Task<Section> UpdateAsync(Section section);
        Task<Section?> FindByIdAsync(Guid id);

		Task<List<Section>> GetSectionsByIdsAndCourseAsync(IEnumerable<Guid> ids, Guid courseId);
	}
}
