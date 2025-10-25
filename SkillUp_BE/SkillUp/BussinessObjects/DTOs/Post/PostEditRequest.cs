using Microsoft.AspNetCore.Http;

namespace SkillUp.BussinessObjects.DTOs.Post
{
    public class PostEditRequest
    {
        public string Title { get; set; } = null!;
        public string Contents { get; set; } = null!;
        public List<IFormFile>? Images { get; set; }  // Có thể thêm hình mới
    }
}
