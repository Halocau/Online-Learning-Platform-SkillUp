using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Post
{
    public class PostUpdateRequest
    {
        [Required]
        public string Title { get; set; } = null!;

        [Required]
        public string Contents { get; set; } = null!;

        public List<IFormFile>? Images { get; set; }
    }
}
