using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.Dtos.Section
{
    // DTO để nhận dữ liệu khi cập nhật
    public class SectionUpdateDto
    {
        [Required(ErrorMessage = "Tiêu đề là bắt buộc")]
        [StringLength(200, MinimumLength = 3, ErrorMessage = "Tiêu đề phải từ 3 đến 200 ký tự")]
        public string Title { get; set; }

        [StringLength(1000, ErrorMessage = "Mô tả không được vượt quá 1000 ký tự")]
        public string? Description { get; set; }
    }
}