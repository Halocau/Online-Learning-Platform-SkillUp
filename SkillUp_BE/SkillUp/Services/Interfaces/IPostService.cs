using SkillUp.BussinessObjects.DTOs.Post;

namespace SkillUp.Services.Interfaces
{
    public interface IPostService
    {
        Task<object> CreatePostAsync(PostCreateRequest request, Guid accountId);
        Task<object> ViewAllPostsAsync();
        Task<object> ViewActivePostsAsync();
        Task<object> ViewUserPostsAsync(Guid accountId, bool includeInactive);
        Task<object> UpdatePostAsync(Guid id, PostUpdateRequest request, Guid accountId);
        Task<object> DeletePostAsync(Guid id, Guid accountId);
    }
}
