using SkillUp.BussinessObjects.DTOs.Post;
using SkillUp.BussinessObjects.Models;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepo;
        private readonly CloudinaryService _cloudinaryService;

        public PostService(IPostRepository postRepo, CloudinaryService cloudinaryService)
        {
            _postRepo = postRepo;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<object> CreatePostAsync(PostCreateRequest request, Guid accountId)
        {
            var post = new Post
            {
                Id = Guid.NewGuid(),
                AccountId = accountId,
                ForumCategoryId = request.ForumCategoryId,
                Title = request.Title,
                Contents = request.Contents,
                CreatedAt = DateTime.UtcNow,
                Status = "Active"
            };

            await _postRepo.AddAsync(post);
            await _postRepo.SaveChangesAsync();

            if (request.Images != null && request.Images.Any())
            {
                foreach (var image in request.Images)
                {
                    var imageUrl = await _cloudinaryService.UploadImageAsync(image, "skillup/posts");
                    post.PostImages.Add(new PostImage
                    {
                        Id = Guid.NewGuid(),
                        PostId = post.Id,
                        ImageUrl = imageUrl
                    });
                }
                await _postRepo.SaveChangesAsync();
            }

            return new { post.Id, post.Title, post.Contents, post.CreatedAt };
        }

        public async Task<object> ViewAllPostsAsync()
        {
            var posts = await _postRepo.GetAllAsync();
            return posts.Select(p => new
            {
                p.Id,
                p.Title,
                p.Contents,
                p.Status,
                AccountName = p.Account.Fullname,
                CategoryName = p.ForumCategory.Name,
                Images = p.PostImages.Select(i => i.ImageUrl)
            });
        }

        public async Task<object> ViewActivePostsAsync()
        {
            var posts = await _postRepo.GetActiveAsync();
            return posts.Select(p => new
            {
                p.Id,
                p.Title,
                p.Contents,
                AccountName = p.Account.Fullname,
                CategoryName = p.ForumCategory.Name,
                Images = p.PostImages.Select(i => i.ImageUrl)
            });
        }

        public async Task<object> ViewUserPostsAsync(Guid accountId, bool includeInactive)
        {
            var posts = await _postRepo.GetByUserIdAsync(accountId, includeInactive);
            return posts.Select(p => new
            {
                p.Id,
                p.Title,
                p.Contents,
                p.Status,
                CategoryName = p.ForumCategory.Name,
                Images = p.PostImages.Select(i => i.ImageUrl)
            });
        }

        public async Task<object> UpdatePostAsync(Guid id, PostUpdateRequest request, Guid accountId)
        {
            var post = await _postRepo.GetByIdAsync(id);
            if (post == null || post.AccountId != accountId)
                throw new Exception("Post not found or unauthorized.");

            post.Title = request.Title;
            post.Contents = request.Contents;
            post.UpdatedAt = DateTime.UtcNow;

            if (request.Images != null && request.Images.Any())
            {
                foreach (var image in request.Images)
                {
                    var imageUrl = await _cloudinaryService.UploadImageAsync(image, "skillup/posts");
                    post.PostImages.Add(new PostImage
                    {
                        Id = Guid.NewGuid(),
                        PostId = post.Id,
                        ImageUrl = imageUrl
                    });
                }
            }

            await _postRepo.UpdateAsync(post);
            await _postRepo.SaveChangesAsync();

            return new { message = "Post updated successfully", post.Id };
        }

        public async Task<object> DeletePostAsync(Guid id, Guid accountId)
        {
            var post = await _postRepo.GetByIdAsync(id);
            if (post == null || post.AccountId != accountId)
                throw new Exception("Post not found or unauthorized.");

            post.Status = "Inactive";
            post.UpdatedAt = DateTime.UtcNow;

            await _postRepo.UpdateAsync(post);
            await _postRepo.SaveChangesAsync();

            return new { message = "Post deleted successfully (set inactive)", post.Id };
        }
    }
}
