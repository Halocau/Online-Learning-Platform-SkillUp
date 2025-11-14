using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Rating
{
    public class CreateRatingDto
    {
        [Required]
        public Guid CourseId { get; set; }

        public string? Contents { get; set; }

        [Required]
        [Range(1, 5)]
        public int? Star { get; set; }
    }
}