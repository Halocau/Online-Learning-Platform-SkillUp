using System;
using System.Threading.Tasks;

namespace SkillUp.Services.Interfaces
{
    public interface ILikeCommentPostService
    {
        /// <summary> Toggle like và trả về tổng like hiện tại </summary>
        Task<int> LikeOrUnlikeCommentAsync(Guid accountId, Guid commentPostId);

        /// <summary> Lấy tổng like (nếu cần): </summary>
        Task<int> CountLikesAsync(Guid commentPostId);
    }
}
