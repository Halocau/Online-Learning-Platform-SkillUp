using SkillUp.BussinessObjects.DTOs.Post;
using System.Threading.Tasks;

namespace SkillUp.Services.Interfaces
{
    public interface IPostService
    {
        Task<object> CreatePostAsync(PostCreateRequest request, Guid accountId);
        Task<object> ViewAllPostsAsync();
        Task<object> ViewActivePostsAsync();
        Task<object> ViewUserPostsAsync(Guid accountId, bool includeInactive);
    }
}
