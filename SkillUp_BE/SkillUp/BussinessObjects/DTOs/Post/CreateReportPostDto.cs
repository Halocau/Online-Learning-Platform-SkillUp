using System;
using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.ReportPost
{
    public class CreateReportPostDto
    {
        [Required]
        public Guid PostId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "Lý do báo cáo phải có ít nhất 1 ký tự.")]
        public string Description { get; set; }
    }
}