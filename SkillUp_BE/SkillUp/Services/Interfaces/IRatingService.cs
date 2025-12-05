using SkillUp.BussinessObjects.DTOs.Rating;

namespace SkillUp.Services.Interfaces
{
    public interface IRatingService
    {
        Task<RatingDto> CreateRatingAsync(CreateRatingDto dto, Guid accountId);
        Task<RatingDto> UpdateRatingAsync(UpdateRatingDto dto, Guid accountId);
        Task DeleteRatingAsync(int ratingId, Guid accountId);
        Task<RatingResponseDto> GetRatingsByCourseIdAsync(Guid courseId);
        Task<IEnumerable<RatingDto>> GetRatingsByAccountIdAsync(Guid accountId, Guid? courseId = null);

    }
}