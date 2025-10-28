namespace SkillUp.BussinessObjects.DTOs.Post
{
    public class PostResponse
    {
        public Guid Id { get; set; }
        public Guid AccountId { get; set; }
        public string Title { get; set; } = null!;
        public string Contents { get; set; } = null!;
        public string Status { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string AccountName { get; set; } = null!;
        public string CategoryName { get; set; } = null!;
        public List<string> ImageUrls { get; set; } = new();
    }
}
