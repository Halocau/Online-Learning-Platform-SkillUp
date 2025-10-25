using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.DTOs.Post;
using SkillUp.BussinessObjects.Models;
using SkillUp.Services.Common;
using SkillUp.Services.Interfaces;

namespace SkillUp.Services.Implementations
{
    public class PostService : IPostService
    {
        private readonly SkillUpContext _context;
        private readonly CloudinaryService _cloudinaryService;

        public PostService(SkillUpContext context, CloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        // 🟢 Tạo bài viết mới
        public async Task<object> CreatePostAsync(PostCreateRequest request, Guid accountId)
        {
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == accountId);
            if (account == null)
                throw new Exception("Account not found.");

            var category = await _context.ForumCategories.FirstOrDefaultAsync(c => c.Id == request.ForumCategoryId);
            if (category == null)
                throw new Exception("Forum category not found.");

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

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            if (request.Images != null && request.Images.Any())
            {
                foreach (var image in request.Images)
                {
                    var imageUrl = await _cloudinaryService.UploadImageAsync(image, "skillup/posts");
                    _context.PostImages.Add(new PostImage
                    {
                        Id = Guid.NewGuid(),
                        PostId = post.Id,
                        ImageUrl = imageUrl
                    });
                }
                await _context.SaveChangesAsync();
            }

            return new
            {
                post.Id,
                post.Title,
                post.Contents,
                post.CreatedAt,
                AccountName = account.Fullname,
                CategoryName = category.Name
            };
        }

        // 🔵 Lấy tất cả bài viết (cả active & inactive)
        public async Task<object> ViewAllPostsAsync()
        {
            var posts = await _context.Posts
                .Include(p => p.Account)
                .Include(p => p.ForumCategory)
                .Include(p => p.CommentPosts)
                .Include(p => p.PostImages)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            var data = posts.Select(p => new
            {
                p.Id,
                p.Title,
                p.Contents,
                p.Status,
                AccountName = p.Account.Fullname,
                CategoryName = p.ForumCategory.Name,
                CommentCount = p.CommentPosts.Count,
                ImageUrls = p.PostImages.Select(i => i.ImageUrl).ToList()
            });

            return new { total = data.Count(), data };
        }

        // 🟢 Lấy tất cả bài viết đang active
        public async Task<object> ViewActivePostsAsync()
        {
            var posts = await _context.Posts
                .Where(p => p.Status == "Active")
                .Include(p => p.Account)
                .Include(p => p.ForumCategory)
                .Include(p => p.PostImages)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            var data = posts.Select(p => new
            {
                p.Id,
                p.Title,
                p.Contents,
                AccountName = p.Account.Fullname,
                CategoryName = p.ForumCategory.Name,
                Images = p.PostImages.Select(i => i.ImageUrl)
            });

            return new { total = data.Count(), data };
        }

        // 🟣 Lấy bài viết của 1 user
        public async Task<object> ViewUserPostsAsync(Guid accountId, bool includeInactive)
        {
            var query = _context.Posts
                .Include(p => p.ForumCategory)
                .Include(p => p.PostImages)
                .Where(p => p.AccountId == accountId);

            if (!includeInactive)
                query = query.Where(p => p.Status == "Active");

            var posts = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();

            var data = posts.Select(p => new
            {
                p.Id,
                p.Title,
                p.Contents,
                p.Status,
                CategoryName = p.ForumCategory.Name,
                Images = p.PostImages.Select(i => i.ImageUrl)
            });

            return new { total = data.Count(), data };
        }

        // ✏️ Chỉnh sửa bài viết
        public async Task<object> EditPostAsync(Guid postId, PostEditRequest request, Guid accountId)
        {
            var post = await _context.Posts
                .Include(p => p.PostImages)
                .FirstOrDefaultAsync(p => p.Id == postId && p.AccountId == accountId);

            if (post == null)
                throw new Exception("Post not found or unauthorized.");

            post.Title = request.Title;
            post.Contents = request.Contents;
            post.UpdatedAt = DateTime.UtcNow;

            if (request.Images != null && request.Images.Any())
            {
                foreach (var image in request.Images)
                {
                    var imageUrl = await _cloudinaryService.UploadImageAsync(image, "skillup/posts");
                    _context.PostImages.Add(new PostImage
                    {
                        Id = Guid.NewGuid(),
                        PostId = post.Id,
                        ImageUrl = imageUrl
                    });
                }
            }

            await _context.SaveChangesAsync();

            return new
            {
                post.Id,
                post.Title,
                post.Contents,
                post.UpdatedAt,
                post.Status
            };
        }

        // ❌ Xóa bài viết (soft delete)
        public async Task<object> DeletePostAsync(Guid postId, Guid accountId)
        {
            var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == postId && p.AccountId == accountId);
            if (post == null)
                throw new Exception("Post not found or unauthorized.");

            post.Status = "Inactive";
            post.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new
            {
                post.Id,
                post.Title,
                post.Status
            };
        }
    }
}
