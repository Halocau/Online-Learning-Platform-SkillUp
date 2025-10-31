using System;
using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Comment
{
    public class ResolveCommentReportDto
    {
        [Required]
        public Guid ReportId { get; set; } // ID của cái report cần xử lý

        [Required]
        // true = Báo cáo hợp lệ, xóa comment.
        // false = Báo cáo không hợp lệ, bỏ qua.
        public bool ShouldDeleteComment { get; set; }
    }
}