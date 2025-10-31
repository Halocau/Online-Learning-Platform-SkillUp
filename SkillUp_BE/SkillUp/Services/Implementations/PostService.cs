using SkillUp.BussinessObjects.DTOs.Post;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepository;
        private readonly CloudinaryService _cloudinaryService;

        public PostService(IPostRepository postRepository, CloudinaryService cloudinaryService)
        {
            _postRepository = postRepository;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<PostResponse> CreatePostAsync(PostCreateRequest request, Guid userId)
        {
            var post = new Post
            {
                Id = Guid.NewGuid(),
                AccountId = userId,
                ForumCategoryId = request.ForumCategoryId,
                Title = request.Title,
                Contents = request.Contents,
                CreatedAt = DateTime.UtcNow,
                Status = "Active"
            };

            if (request.Images != null && request.Images.Count > 0)
            {
                foreach (var file in request.Images)
                {
                    var imageUrl = await _cloudinaryService.UploadImageAsync(file);
                    post.PostImages.Add(new PostImage
                    {
                        Id = Guid.NewGuid(),
                        ImageUrl = imageUrl,
                        PostId = post.Id
                    });
                }
            }

            await _postRepository.CreateAsync(post);
            await _postRepository.SaveAsync();

            return MapToResponse(post);
        }

        public async Task<PostResponse> UpdatePostAsync(Guid id, PostUpdateRequest request, Guid userId)
        {
            var post = await _postRepository.GetByIdAsync(id)
                ?? throw new Exception("Post not found");

            if (post.AccountId != userId)
                throw new Exception("You cannot update another user's post");

            post.Title = request.Title;
            post.Contents = request.Contents;
            post.UpdatedAt = DateTime.UtcNow;

            if (request.Images != null && request.Images.Count > 0)
            {
                post.PostImages.Clear();
                foreach (var file in request.Images)
                {
                    var imageUrl = await _cloudinaryService.UploadImageAsync(file);
                    post.PostImages.Add(new PostImage
                    {
                        Id = Guid.NewGuid(),
                        PostId = post.Id,
                        ImageUrl = imageUrl
                    });
                }
            }

            await _postRepository.UpdateAsync(post);
            await _postRepository.SaveAsync();

            return MapToResponse(post);
        }

        public async Task<bool> DeletePostAsync(Guid id, Guid userId)
        {
            var post = await _postRepository.GetByIdAsync(id)
                ?? throw new Exception("Post not found");

            if (post.AccountId != userId)
                throw new Exception("You cannot delete another user's post");

            post.Status = "Inactive";
            await _postRepository.UpdateAsync(post);
            await _postRepository.SaveAsync();

            return true;
        }

        public async Task<IEnumerable<PostResponse>> ViewAllPostsAsync()
        {
            var posts = await _postRepository.GetAllAsync();
            return posts.Select(MapToResponse);
        }

        public async Task<IEnumerable<PostResponse>> ViewActivePostsAsync()
        {
            var posts = await _postRepository.GetActiveAsync();
            return posts.Select(MapToResponse);
        }

        public async Task<IEnumerable<PostResponse>> ViewUserPostsAsync(Guid accountId, bool includeInactive)
        {
            var posts = await _postRepository.GetByUserAsync(accountId, includeInactive);
            return posts.Select(MapToResponse);
        }

        private PostResponse MapToResponse(Post post)
        {
            return new PostResponse
            {
                Id = post.Id,
                AccountId = post.AccountId,
                Title = post.Title,
                Contents = post.Contents,
                Status = post.Status,
                CreatedAt = post.CreatedAt,
                UpdatedAt = post.UpdatedAt,
                AccountName = post.Account?.Fullname ?? "",
                CategoryName = post.ForumCategory?.Name ?? "",
                ImageUrls = post.PostImages.Select(i => i.ImageUrl).ToList()
            };
        }

        public async Task<bool> BanPostAsync(Guid id)
        {
            var post = await _postRepository.GetByIdAsync(id)
                ?? throw new Exception("Post not found");

            post.Status = "Inactive"; // Đặt trạng thái mới
            await _postRepository.UpdateAsync(post);
            await _postRepository.SaveAsync();
            return true;
        }

        public async Task<bool> UnbanPostAsync(Guid id)
        {
            var post = await _postRepository.GetByIdAsync(id)
                ?? throw new Exception("Post not found");

          
            post.Status = "Active";
            await _postRepository.UpdateAsync(post);
            await _postRepository.SaveAsync();
            return true;
        }
        public async Task<PostDto> GetPostByIdAsync(Guid id)
        {
            var post = await _postRepository.GetByIdAsync(id)
                ?? throw new Exception("Không tìm thấy bài viết.");

            if (post.Status == "Inactive" )
            {
                throw new Exception("Không tìm thấy bài viết.");
                // TODO: Nâng cao: Có thể check role ở đây
                // Nếu là admin/mod thì vẫn cho xem
            }

            return new PostDto
            {
                Id = post.Id,
                AccountId = post.AccountId,
                ForumCategoryId = post.ForumCategoryId,
                Title = post.Title,
                Contents = post.Contents,
                CreatedAt = post.CreatedAt,
                UpdatedAt = post.UpdatedAt,
                Status = post.Status,
                AuthorName = post.Account.Fullname,     
                CategoryName = post.ForumCategory.Name, 
                ImageUrls = post.PostImages?.Select(pi => pi.ImageUrl).ToList(),
                CommentCount = post.CommentPosts?.Count ?? 0
            };
        }
    }
}
