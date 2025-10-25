using Microsoft.AspNetCore.Http;

using System.Text.Json.Serialization;

namespace SkillUp.BussinessObjects.DTOs.Post
{
    public class PostCreateRequest
    {
        
        [JsonIgnore]
        public Guid AccountId { get; set; }

        public int ForumCategoryId { get; set; }
        public string Title { get; set; } = null!;
        public string Contents { get; set; } = null!;
        public List<IFormFile>? Images { get; set; }
    }
}
