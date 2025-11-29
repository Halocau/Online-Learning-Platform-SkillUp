using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.ReportCourse
{
    // DTO cho Student gửi báo cáo
    public class CreateReportCourseDto
    {
        [Required]
        public Guid CourseId { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập lý do báo cáo")]
        public string Description { get; set; } = null!;
    }

}