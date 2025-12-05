using System;
using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Comment
{
    public class CreateCommentReportDto
    {
        [Required(ErrorMessage = "CommentPostId là bắt buộc")]
        public Guid CommentPostId { get; set; }

        [Required(ErrorMessage = "Lý do là bắt buộc")]
        [StringLength(500, MinimumLength = 1, ErrorMessage = "Lý do phải từ 10 đến 500 ký tự")]
        public string Reason { get; set; } = null!;
    }
}