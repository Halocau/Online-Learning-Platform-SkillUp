using System.ComponentModel.DataAnnotations;

namespace SkillUp.BussinessObjects.DTOs.Rating
{
    public class UpdateRatingDto
    {
        [Required]
        public int RatingId { get; set; } // Model 'Rating' của bạn dùng 'int'

        public string? Contents { get; set; }

        [Required]
        [Range(1, 5)]
        public int? Star { get; set; }
    }
}