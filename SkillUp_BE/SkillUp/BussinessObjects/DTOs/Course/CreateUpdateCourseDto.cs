using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Course
{
    public class CreateUpdateCourseDto
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public IFormFile Image { get; set; }

        [Required]
        public int CategoryId { get; set; }

        [Required]
        public int SubCategoryId { get; set; }

        /// <summary>
        /// Bật AI hỗ trợ học sinh cho khóa học.
        /// Nullable để backend có thể phân biệt khi client không gửi.
        /// </summary>
        public bool? IsAiSupport { get; set; }
    }
}
