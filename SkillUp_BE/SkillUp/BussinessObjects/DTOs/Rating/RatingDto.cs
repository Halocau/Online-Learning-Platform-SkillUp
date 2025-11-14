namespace SkillUp.BussinessObjects.DTOs.Rating
{
    public class RatingDto
    {
        public int Id { get; set; }
        public Guid StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public Guid CourseId { get; set; }
        public string? Contents { get; set; }
        public int? Star { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}