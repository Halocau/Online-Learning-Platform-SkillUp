using SkillUp.BussinessObjects.DTOs.ReportCourse;

namespace SkillUp.Services.Interfaces
{
    public interface IReportCourseService
    {
        Task<string?> CreateReportAsync(Guid accountId, CreateReportCourseDto request);
        Task<List<ReportCourseResponseDto>> GetAllReportsAsync();
        Task<List<CourseReportGroupDto>> GetGroupedReportsAsync();
        Task<string?> UpdateReportStatusAsync(Guid reportId, string newStatus);
    }
}