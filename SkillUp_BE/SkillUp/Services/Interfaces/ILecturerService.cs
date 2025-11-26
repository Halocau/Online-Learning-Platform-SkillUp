using SkillUp.BussinessObjects.DTOs;
using SkillUp.BussinessObjects.DTOs.Lecturer;
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
    public interface ILecturerService
    {
        // Lấy thông tin Lecturer theo AccountId
        Task<LecturerDto> GetLecturerByAccountIdAsync(Guid accountId);

        // Cập nhật thông tin Lecturer
        Task<bool> UpdateLecturerAsync(Guid accountId, LecturerUpdateDto updateDto);

        // Thêm Lecturer mới
        Task<LecturerDto> AddLecturerAsync(LecturerCreateDto createDto);
        Task<bool> CreateLecturerAsync(Lecturer newLecturer);
        // Lấy tất cả Lecturer
        Task<List<LecturerDto>> GetAllLecturersAsync();
        Task<bool> UpdateLecturerInfoAsync(Guid? accountId, string? title, string? profession);

        //Task<LecturerProfileResponse> GetLecturerProfileAsync(Guid lecturerId);
        Task<LecturerProfileDto?> GetProfileByAccountIdAsync(Guid accountId);
        Task<bool> UpdateLecturerProfileAsync(Guid accountId, UpdateLecturerProfileDto request);
    }
}
