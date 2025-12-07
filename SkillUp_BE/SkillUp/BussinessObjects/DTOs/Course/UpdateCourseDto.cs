namespace SkillUp.BussinessObjects.DTOs.Course
{
    public class UpdateCourseDto
    {
        public string? Title { get; set; }

        public string? Description { get; set; }

        public IFormFile? Image { get; set; }
        public int? SubCategoryId { get; set; }

        /// <summary>
        /// Bật/tắt AI hỗ trợ học sinh cho khóa học.
        /// Nullable để phân biệt trường hợp client không gửi.
        /// </summary>
        public bool? IsAiSupport { get; set; }
    }
}
