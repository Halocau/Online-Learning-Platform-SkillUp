using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.ReportCourse
{
    public class UpdateReportStatusDto
    {
        [Required]
        public string Status { get; set; } = null!; // "Accepted", "Rejected"
    }
}