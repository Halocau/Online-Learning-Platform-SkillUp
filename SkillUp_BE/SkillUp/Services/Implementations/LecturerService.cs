using SkillUp.BussinessObjects.DTOs;
using SkillUp.BussinessObjects.DTOs.Lecturer;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class LecturerService : ILecturerService
    {
        private readonly ILecturerRepository _lecturerRepository;
        private readonly ILecturerRepository _repository;

        public LecturerService(ILecturerRepository lecturerRepository, ILecturerRepository repository)
        {
            _lecturerRepository = lecturerRepository;
            _repository = repository;
        }
        public async Task<bool> CreateLecturerAsync(Lecturer newLecturer)
        {
            // Thêm Lecturer mới vào cơ sở dữ liệu
            await _lecturerRepository.AddAsync(newLecturer);
            return await _lecturerRepository.SaveChangesAsync();
        }
        // Lấy thông tin Lecturer theo AccountId
        public async Task<LecturerDto> GetLecturerByAccountIdAsync(Guid accountId)
        {
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accountId);

            if (lecturer == null)
                return null;

            return new LecturerDto
            {
                Id = lecturer.Id,
                Title = lecturer.Title,
                Profession = lecturer.Profession
            };
        }

        // Cập nhật thông tin Lecturer
        public async Task<bool> UpdateLecturerAsync(Guid accountId, LecturerUpdateDto updateDto)
        {
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accountId);

            if (lecturer == null)
                return false;

            lecturer.Title = updateDto.Title;
            lecturer.Profession = updateDto.Profession;

            await _lecturerRepository.UpdateAsync(lecturer);
            return await _lecturerRepository.SaveChangesAsync();
        }

        // Thêm Lecturer mới
        public async Task<LecturerDto> AddLecturerAsync(LecturerCreateDto createDto)
        {
            var lecturer = new Lecturer
            {
                Id = Guid.NewGuid(),
                AccountId = createDto.AccountId,
                Title = createDto.Title,
                Profession = createDto.Profession
            };

            await _lecturerRepository.AddAsync(lecturer);
            await _lecturerRepository.SaveChangesAsync();

            return new LecturerDto
            {
                Title = lecturer.Title,
                Profession = lecturer.Profession
            };
        }

        // Lấy tất cả Lecturer
        public async Task<List<LecturerDto>> GetAllLecturersAsync()
        {
            var lecturers = await _lecturerRepository.GetAllLecturersAsync();

            return lecturers.Select(lecturer => new LecturerDto
            {
                Title = lecturer.Title,
                Profession = lecturer.Profession
            }).ToList();
        }

   

        // Cập nhật thông tin Lecturer sau khi thay đổi trạng thái đơn ứng tuyển
        public async Task<bool> UpdateLecturerInfoAsync(Guid? accountId, string? title, string? profession)
        {
            // Kiểm tra nếu accountId không có giá trị
            if (accountId == null)
            {
                return false; // Nếu accountId là null, không thể cập nhật
            }

            // Lấy Lecturer từ AccountId
            var lecturer = await _lecturerRepository.GetByAccountIdAsync(accountId.Value); // accountId là Nullable, cần lấy .Value
            if (lecturer == null)
            {
                return false; // Lecturer không tồn tại
            }

            // Cập nhật Title và Profession
            lecturer.Title = title;
            lecturer.Profession = profession;

            // Lưu thay đổi vào cơ sở dữ liệu
            await _lecturerRepository.UpdateAsync(lecturer);
            return await _lecturerRepository.SaveChangesAsync();
        }

        public async Task<LecturerProfileResponse> GetLecturerProfileAsync(Guid lecturerId)
        {
            var lecturer = await _repository.GetLecturerByIdAsync(lecturerId);

            if (lecturer == null)
            {
                throw new Exception("Lecturer not found"); // Hoặc sử dụng Custom Exception
            }

            // Mapping thủ công từ Entity sang DTO
            // (Có thể dùng AutoMapper nếu project có cài đặt)
            return new LecturerProfileResponse
            {
                Title = lecturer.Title,
                Profession = lecturer.Profession,
                BankNumber = lecturer.BankNumber,
                BankName = lecturer.BankName,
                ReceiverName = lecturer.ReceiverName
            };
        }
    }
}
