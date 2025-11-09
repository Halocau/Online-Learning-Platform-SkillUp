// File: /BussinessObjects/DTOs/Comment/CreateCommentReportLessonDto.cs
namespace SkillUp.BussinessObjects.DTOs.Comment
{
    // DTO này dùng khi User gửi request báo cáo
    public class CreateCommentReportLessonDto
    {
        public Guid CommentLessonId { get; set; }
        public string Reason { get; set; } = null!;
    }
}