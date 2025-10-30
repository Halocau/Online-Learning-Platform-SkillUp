using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Interfaces;
using System;
using System.Threading.Tasks;

namespace SkillUp.Services.Implementations
{
    public class LikeCommentPostService : ILikeCommentPostService
    {
        private readonly ILikeCommentPostRepository _likeRepo;

        public LikeCommentPostService(ILikeCommentPostRepository likeRepo)
        {
            _likeRepo = likeRepo;
        }

        public async Task<int> LikeOrUnlikeCommentAsync(Guid accountId, Guid commentPostId)
        {
            await _likeRepo.AddOrToggleLikeAsync(accountId, commentPostId);
            return await _likeRepo.CountLikesAsync(commentPostId);
        }

        public async Task<int> CountLikesAsync(Guid commentPostId)
        {
            return await _likeRepo.CountLikesAsync(commentPostId);
        }
    }
}
