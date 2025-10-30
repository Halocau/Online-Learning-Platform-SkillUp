using SkillUp.BussinessObjects.DTOs.Comment;
using SkillUp.BussinessObjects.Models;

namespace SkillUp.Services.Interfaces
{
    public interface ICommentPostService
    {
       
        Task<IEnumerable<CommentPostDto>> GetCommentsByPostIdAsync(Guid postId);
        Task<CommentPostDto> CreateCommentAsync(CreateCommentDto dto, Guid accountId);
        Task<CommentPostDto> UpdateCommentAsync(UpdateCommentDto dto, Guid accountId);
    }
}
