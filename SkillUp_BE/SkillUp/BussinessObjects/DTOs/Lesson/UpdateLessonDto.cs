using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Lesson
{
    public class UpdateLessonDto
    {
        [Required(ErrorMessage = "Tiêu đề là bắt buộc")]
        [StringLength(200, ErrorMessage = "Tiêu đề không được vượt quá 200 ký tự")]
        public string Title { get; set; } = null!;

        [StringLength(1000, ErrorMessage = "Mô tả không được vượt quá 1000 ký tự")]
        public string? Description { get; set; }

        [Range(1, double.MaxValue, ErrorMessage = "Thứ tự bài học phải lớn hơn 0")]
        public double LessonOrder { get; set; }

        public bool IsFree { get; set; }

        // Cho Text type - update content
        public string? Content { get; set; }

        // Cho Video type - update video
        public IFormFile? VideoFile { get; set; }
    }
}
