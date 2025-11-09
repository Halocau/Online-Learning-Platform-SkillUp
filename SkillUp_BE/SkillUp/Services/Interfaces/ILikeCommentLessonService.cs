// File: /Services/Interfaces/ILikeCommentLessonService.cs

using SkillUp.BussinessObjects.DTOs.Like;

namespace SkillUp.Services.Interfaces
{
    public interface ILikeCommentLessonService
    {
        Task<LikeCommentLessonResponseDto> ToggleLikeAsync(Guid commentLessonId, Guid accountId);
        Task<IEnumerable<LikeCommentLessonResponseDto>> GetLikeStatusesForLessonAsync(Guid lessonId, Guid? accountId);
        Task<LikeCommentLessonResponseDto> GetLikeStatusForCommentAsync(Guid commentLessonId, Guid? accountId);
    }
}