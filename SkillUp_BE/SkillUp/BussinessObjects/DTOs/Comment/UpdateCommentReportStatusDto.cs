// File: /BussinessObjects/DTOs/Comment/UpdateCommentReportStatusDto.cs
namespace SkillUp.BussinessObjects.DTOs.Comment
{
    // DTO này dùng khi Admin xử lý báo cáo
    public class UpdateCommentReportStatusDto
    {
        public Guid ReportId { get; set; }
        public bool IsApproved { get; set; }
    }
}