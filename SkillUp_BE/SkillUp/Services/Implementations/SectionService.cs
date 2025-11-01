using SkillUp.BussinessObjects.Dtos.Section;
using SkillUp.BussinessObjects.Models;
//using SkillUp.Data.Repositories;
using SkillUp.Repositories.Interfaces;

namespace SkillUp.Bussiness.Services
{
    public class SectionService : ISectionService
    {
        private readonly ISectionRepository _sectionRepository;

        public SectionService(ISectionRepository sectionRepository)
        {
            _sectionRepository = sectionRepository;
        }

      
        private SectionDto MapToDto(Section section)
        {
            return new SectionDto
            {
                Id = section.Id,
                CourseId = section.CourseId,
                Title = section.Title,
                Description = section.Description,
                CreatedAt = section.CreatedAt,
                IsActive = section.IsActive
            };
        }

        public async Task<SectionDto> CreateSectionAsync(SectionCreateDto createDto)
        {
            // (Code từ trước... không đổi)
            var section = new Section
            {
                Id = Guid.NewGuid(),
                CourseId = createDto.CourseId,
                Title = createDto.Title,
                Description = createDto.Description,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                IsActive = true
            };
            var createdSection = await _sectionRepository.CreateAsync(section);
            return MapToDto(createdSection);
        }

        

        public async Task<SectionDto?> GetSectionByIdAsync(Guid id)
        {
            var section = await _sectionRepository.GetByIdAsync(id);
            if (section == null)
            {
                return null; // Controller sẽ trả về 404
            }
            return MapToDto(section);
        }

        public async Task<IEnumerable<SectionDto>> GetSectionsByCourseIdAsync(Guid courseId)
        {
            var sections = await _sectionRepository.GetByCourseIdAsync(courseId);
            return sections.Select(MapToDto); // Chuyển List<Section> thành List<SectionDto>
        }

        public async Task<SectionDto?> UpdateSectionAsync(Guid id, SectionUpdateDto updateDto)
        {
            // SỬA: Dùng FindByIdAsync để cho phép sửa section đã bị vô hiệu hóa
            var section = await _sectionRepository.FindByIdAsync(id);
            if (section == null)
            {
                return null;
            }

            section.Title = updateDto.Title;
            section.Description = updateDto.Description;
            section.UpdatedAt = DateTime.UtcNow;

            var updatedSection = await _sectionRepository.UpdateAsync(section);
            return MapToDto(updatedSection);
        }

        public async Task<bool> DeleteSectionAsync(Guid id)
        {
            // SỬA: Dùng FindByIdAsync để tìm (kể cả nó đang active hay inactive)
            var section = await _sectionRepository.FindByIdAsync(id);
            if (section == null)
            {
                return false; // Không tìm thấy section
            }
            // Nếu đã xóa rồi thì thôi
            if (section.IsActive == false)
            {
                return true; // Vẫn báo thành công
            }

            section.IsActive = false;
            section.UpdatedAt = DateTime.UtcNow;

            await _sectionRepository.UpdateAsync(section);
            return true;
        }
        public async Task<SectionDto?> RestoreSectionAsync(Guid id)
        {
            // Dùng FindByIdAsync để tìm section đã bị xóa
            var section = await _sectionRepository.FindByIdAsync(id);
            if (section == null)
            {
                return null; // Không tìm thấy
            }

            // Nếu đã khôi phục rồi thì thôi
            if (section.IsActive == true)
            {
                return MapToDto(section);
            }

            // Thực hiện khôi phục
            section.IsActive = true;
            section.UpdatedAt = DateTime.UtcNow;

            var updatedSection = await _sectionRepository.UpdateAsync(section);
            return MapToDto(updatedSection);
        }
    }
}