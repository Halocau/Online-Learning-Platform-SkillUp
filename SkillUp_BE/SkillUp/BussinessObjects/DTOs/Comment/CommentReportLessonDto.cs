// File: /BussinessObjects/DTOs/Comment/CommentReportLessonDto.cs
namespace SkillUp.BussinessObjects.DTOs.Comment
{
    // DTO này dùng để hiển thị cho Admin
    public class CommentReportLessonDto
    {
        public Guid Id { get; set; }
        public string Reason { get; set; } = null!;
        public string Status { get; set; } = null!;
        public DateTime CreatedAt { get; set; }

        // Người báo cáo
        public Guid ReporterId { get; set; }
        public string ReporterName { get; set; } = null!;

        // Bình luận bị báo cáo
        public Guid CommentId { get; set; }
        public string CommentContents { get; set; } = null!;
        public string CommentAuthorName { get; set; } = null!;
    }
}