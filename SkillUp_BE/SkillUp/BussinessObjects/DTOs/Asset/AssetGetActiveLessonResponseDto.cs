namespace SkillUp.BussinessObjects.DTOs.Asset
{
    public class AssetGetActiveLessonResponseDto
    {
        public Guid Id { get; set; }
        public string? Url { get; set; }
        public string? Contents { get; set; }
        public string? FileUrl { get; set; }
    }
}
