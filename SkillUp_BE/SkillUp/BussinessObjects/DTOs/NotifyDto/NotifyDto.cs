using Microsoft.AspNetCore.Mvc;

namespace SkillUp.BussinessObjects.DTOs.NotifyDto
{
    public class NotifyDto : Controller
    {
        public Guid Id { get; set; }
        public Guid AccountId { get; set; }
        public string Title { get; set; } = null!;
        public string Contents { get; set; } = null!;
        public string Status { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
    }
}
