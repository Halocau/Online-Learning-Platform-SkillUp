using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.ReportPost
{
    public class ProcessReportDto
    {
        [Required]
        // Hành động có thể là "Resolve" hoặc "Dismiss"
        public string Action { get; set; }
    }
}