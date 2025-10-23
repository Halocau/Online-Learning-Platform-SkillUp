namespace SkillUp.BussinessObjects.DTOs.Post
{
    public class PostCreateRequest
    {
        public Guid AccountId { get; set; }
        public int ForumCategoryId { get; set; }
        public string Title { get; set; } = null!;
        public string Contents { get; set; } = null!;
        public List<IFormFile>? Images { get; set; }
    }
}
