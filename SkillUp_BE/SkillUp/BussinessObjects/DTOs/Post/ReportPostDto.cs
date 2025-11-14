using System;

namespace SkillUp.BussinessObjects.DTOs.ReportPost
{
    public class ReportPostDto
    {
        public Guid Id { get; set; }
        public Guid PostId { get; set; }
        public string PostTitle { get; set; }
        public Guid AccountId { get; set; }
        public string ReporterName { get; set; } 
        public DateTime? CreatedAt { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; }
    }
}