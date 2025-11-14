using SkillUp.BussinessObjects.DTOs.Common;
using SkillUp.BussinessObjects.Models;
using System;
using System.Threading.Tasks;

namespace SkillUp.Repositories.Interfaces
{
    public interface ILikeCommentPostRepository
    {
        Task<LikeCommentPost?> GetByAccountAndCommentAsync(Guid accountId, Guid commentPostId);
        //Task<LikeCommentPost> AddOrToggleLikeAsync(Guid accountId, Guid commentPostId);
        Task<LikeInteractionResult> AddOrToggleLikeAsync(Guid accountId, Guid commentPostId); // Mới
        Task<int> CountLikesAsync(Guid commentPostId);

        Task<Dictionary<Guid, int>> GetLikeCountsForCommentListAsync(IEnumerable<Guid> commentPostIds);


    }
}
