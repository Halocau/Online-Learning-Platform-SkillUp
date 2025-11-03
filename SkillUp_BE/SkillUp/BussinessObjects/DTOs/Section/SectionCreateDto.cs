using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.Dtos.Section
{
    // DTO để nhận dữ liệu từ client khi tạo mới một section
    public class SectionCreateDto
    {
        [Required(ErrorMessage = "CourseId là bắt buộc")]
        public Guid CourseId { get; set; }

        [Required(ErrorMessage = "Tiêu đề là bắt buộc")]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "Tiêu đề phải từ 1 đến 200 ký tự")]
        public string Title { get; set; }

        [StringLength(1000, ErrorMessage = "Mô tả không được vượt quá 1000 ký tự")]
        public string? Description { get; set; }
    }
}