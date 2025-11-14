namespace SkillUp.BussinessObjects.DTOs.Rating
{
    public class RatingResponseDto
    {
        public double? AverageRating { get; set; }
        public IEnumerable<RatingDto> Ratings { get; set; }
    }
}
