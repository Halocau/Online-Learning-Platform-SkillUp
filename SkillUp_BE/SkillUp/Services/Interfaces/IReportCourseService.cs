using SkillUp.BussinessObjects.DTOs.ReportCourse;

namespace SkillUp.Services.Interfaces
{
    public interface IReportCourseService
    {
        Task<string?> CreateReportAsync(Guid accountId, CreateReportCourseDto request);
        Task<List<ReportCourseResponseDto>> GetAllReportsAsync();
        Task<string?> UpdateReportStatusAsync(Guid reportId, string newStatus);
    }
}