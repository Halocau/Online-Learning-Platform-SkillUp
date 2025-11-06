namespace SkillUp.BussinessObjects.DTOs.Asset
{
    public class AssetGetLessonResponseDto
    {
        public Guid Id { get; set; }
        public string? Url { get; set; }
        public bool IsActive { get; set; }
        public string? Contents { get; set; }
        public string? FileUrl { get; set; }
    }
}
