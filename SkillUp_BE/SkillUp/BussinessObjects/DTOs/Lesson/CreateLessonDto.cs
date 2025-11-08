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

        // Tài liệu khóa học (PDF hoặc DOCX) - Optional
        [AllowedExtensions(new[] { ".pdf", ".docx" }, ErrorMessage = "Tài liệu chỉ chấp nhận file PDF hoặc DOCX")]
        public IFormFile? FileUrl { get; set; }
    }

    // Custom validation attribute for file extensions
    public class AllowedExtensionsAttribute : ValidationAttribute
    {
        private readonly string[] _extensions;

        public AllowedExtensionsAttribute(string[] extensions)
        {
            _extensions = extensions;
        }

        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null)
            {
                return ValidationResult.Success; // Allow null (optional field)
            }

            if (value is IFormFile file)
            {
                // Kiểm tra file có nội dung không
                if (file.Length == 0)
                {
                    return new ValidationResult("File tài liệu không được để trống");
                }

                // Kiểm tra extension
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

                if (string.IsNullOrEmpty(extension))
                {
                    return new ValidationResult("File phải có định dạng rõ ràng (PDF hoặc DOCX)");
                }

                if (!_extensions.Contains(extension))
                {
                    return new ValidationResult($"Tài liệu chỉ chấp nhận file PDF hoặc DOCX. File bạn chọn có định dạng: {extension}");
                }

                // Kiểm tra content type (optional nhưng tốt hơn)
                var allowedContentTypes = new[]
                {
                    "application/pdf",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/msword" // .doc cũ
                };

                if (!string.IsNullOrEmpty(file.ContentType) && !allowedContentTypes.Contains(file.ContentType.ToLowerInvariant()))
                {
                    return new ValidationResult($"Loại file không hợp lệ. Chỉ chấp nhận PDF hoặc DOCX");
                }
            }

            return ValidationResult.Success;
        }
    }
}
