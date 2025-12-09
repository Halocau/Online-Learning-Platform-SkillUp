using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.NotifyDto
{
    public class CreateSystemNotificationDto
    {
        [Required(ErrorMessage = "Tiêu đề không được để trống")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Nội dung không được để trống")]
        public string Contents { get; set; }
        public string? Hyperlink { get; set; }
    }
}
