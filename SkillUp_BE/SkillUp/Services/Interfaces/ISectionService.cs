using SkillUp.BussinessObjects.Dtos.Section;

namespace SkillUp.Bussiness.Services
{
    public interface ISectionService
    {
        Task<SectionDto> CreateSectionAsync(SectionCreateDto createDto);
        Task<SectionDto?> GetSectionByIdAsync(Guid id);
        Task<IEnumerable<SectionDto>> GetSectionsByCourseIdAsync(Guid courseId);
        Task<SectionDto?> UpdateSectionAsync(Guid id, SectionUpdateDto updateDto);
        Task<bool> DeleteSectionAsync(Guid id);

        Task<SectionDto?> RestoreSectionAsync(Guid id); 
    }
}