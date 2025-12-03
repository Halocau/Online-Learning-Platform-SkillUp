using System;

namespace SkillUp.BussinessObjects.DTOs.Comment
{
    public class CommentReportDto
    {
        public Guid Id { get; set; }
        public string Reason { get; set; } = null!;
        public string Status { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public Guid AccountId { get; set; } // ID người report
        public Guid CommentPostId { get; set; } // ID comment bị report
        public string? ReporterName { get; set; } // Tên người report
        public string CommentContent { get; set; }
    }
}