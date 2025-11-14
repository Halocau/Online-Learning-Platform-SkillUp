using SkillUp.BussinessObjects.Models;

namespace SkillUp.Repositories.Interfaces
{
    public interface ICommentPostRepository
    {
        Task<IEnumerable<CommentPost>> GetCommentsByPostIdAsync(Guid postId);
        Task<CommentPost> CreateAsync(CommentPost comment);
        Task<CommentPost?> GetByIdAsync(Guid commentId); // thêm dòng này
        Task UpdateAsync(CommentPost comment);           // thêm dòng này


    }
}
