using SkillUp.BussinessObjects.DTOs.Post;

namespace SkillUp.Services.Interfaces
{
    public interface IPostService
    {
        Task<PostResponse> CreatePostAsync(PostCreateRequest request, Guid userId);
        Task<PostResponse> UpdatePostAsync(Guid id, PostUpdateRequest request, Guid userId);
        Task<bool> DeletePostAsync(Guid id, Guid userId);
        Task<IEnumerable<PostResponse>> ViewAllPostsAsync();
        Task<IEnumerable<PostResponse>> ViewActivePostsAsync();
        Task<IEnumerable<PostResponse>> ViewUserPostsAsync(Guid accountId, bool includeInactive);
    }
}
