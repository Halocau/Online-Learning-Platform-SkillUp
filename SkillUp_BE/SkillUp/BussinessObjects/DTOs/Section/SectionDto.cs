namespace SkillUp.BussinessObjects.Dtos.Section
{
    // DTO để trả về dữ liệu cho client
    public class SectionDto
    {
        public Guid Id { get; set; }
        public Guid CourseId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public double? Orders { get; set; }

    }
}