namespace SkillUp.BussinessObjects.DTOs.Cart
{
    public class BulkAddToCartResultDto
    {
        public int Added { get; set; }
        public int Skipped { get; set; }
        public List<Guid> AddedCourseIds { get; set; } = new();
        public List<Guid> SkippedCourseIds { get; set; } = new();
    }
}
