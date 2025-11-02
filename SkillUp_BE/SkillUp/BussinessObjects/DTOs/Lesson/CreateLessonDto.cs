using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Lesson
{
    public class CreateLessonDto
    {
        [Required(ErrorMessage = "SectionId là bắt buộc")]
        public Guid SectionId { get; set; }

        [Required(ErrorMessage = "Tiêu đề là bắt buộc")]
        [StringLength(200, ErrorMessage = "Tiêu đề không được vượt quá 200 ký tự")]
        public string Title { get; set; } = null!;

        [Required(ErrorMessage = "Loại bài học là bắt buộc")]
        [RegularExpression("^(Video|Text)$", ErrorMessage = "Type chỉ có thể là 'Video' hoặc 'Text'")]
        public string Type { get; set; } = null!;

        [StringLength(1000, ErrorMessage = "Mô tả không được vượt quá 1000 ký tự")]
        public string? Description { get; set; }

        [Range(1, double.MaxValue, ErrorMessage = "Thứ tự bài học phải lớn hơn 0")]
        public double LessonOrder { get; set; }

        public bool IsFree { get; set; } = false;

        // Cho Text type
        public string? Content { get; set; }

        // Cho Video type
        public IFormFile? VideoFile { get; set; }
    }
}
