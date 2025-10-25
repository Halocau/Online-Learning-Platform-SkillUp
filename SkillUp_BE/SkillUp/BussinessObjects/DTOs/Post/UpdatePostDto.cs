using Microsoft.AspNetCore.Http;

namespace SkillUp.BussinessObjects.DTOs.Post
{
    public class UpdatePostDto
    {
        public string? Title { get; set; }
        public string? Contents { get; set; }
        public IFormFile? Image { get; set; }
    }
}