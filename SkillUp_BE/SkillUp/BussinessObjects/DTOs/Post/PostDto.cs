namespace SkillUp.BussinessObjects.DTOs.Post
{
    public class PostDto
    {
        public Guid Id { get; set; }
        public Guid AccountId { get; set; }
        public int ForumCategoryId { get; set; }
        public string Title { get; set; } = null!;
        public string Contents { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string Status { get; set; } = null!;

        public string AuthorName { get; set; } = null!;
        public string CategoryName { get; set; } = null!;
        public List<string>? ImageUrls { get; set; }
        public int CommentCount { get; set; }
    }
}
