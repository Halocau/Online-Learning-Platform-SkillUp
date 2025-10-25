using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillUp.BussinessObjects.Models;
using SkillUp.BussinessObjects.DTOs.Post;
using SkillUp.Services.Common;

namespace SkillUp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PostController : ControllerBase
    {
        private readonly SkillUpContext _context;
        private readonly CloudinaryService _cloudinaryService;

        public PostController(SkillUpContext context, CloudinaryService cloudinaryService)
        {
            _context = context;
            _cloudinaryService = cloudinaryService;
        }

        // ✅ Create new post
        [HttpPost("create")]
        public async Task<IActionResult> CreatePost([FromForm] PostCreateRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == request.AccountId);
            var category = await _context.ForumCategories.FirstOrDefaultAsync(fc => fc.Id == request.ForumCategoryId);

            if (account == null)
                return NotFound(new { message = "Account not found" });

            if (category == null)
                return NotFound(new { message = "Forum category not found" });

            var newPost = new Post
            {
                Id = Guid.NewGuid(),
                AccountId = request.AccountId,
                ForumCategoryId = request.ForumCategoryId,
                Title = request.Title,
                Contents = request.Contents,
                CreatedAt = DateTime.UtcNow,
                Status = "Active"
            };

            _context.Posts.Add(newPost);
            await _context.SaveChangesAsync();

            // Upload images if any
            var imageUrls = new List<string>();
            if (request.Images != null && request.Images.Count > 0)
            {
                foreach (var image in request.Images)
                {
                    var imageUrl = await _cloudinaryService.UploadImageAsync(image, "skillup/posts");
                    imageUrls.Add(imageUrl);

                    var postImage = new PostImage
                    {
                        Id = Guid.NewGuid(),
                        PostId = newPost.Id,
                        ImageUrl = imageUrl
                    };
                    _context.PostImages.Add(postImage);
                }
                await _context.SaveChangesAsync();
            }

            var response = new PostDto
            {
                Id = newPost.Id,
                AccountId = newPost.AccountId,
                ForumCategoryId = newPost.ForumCategoryId,
                Title = newPost.Title,
                Contents = newPost.Contents,
                CreatedAt = newPost.CreatedAt,
                Status = newPost.Status,
                AccountName = account.Email,
                ForumCategoryName = category.Name,
                CommentCount = 0,
                PostImageUrls = imageUrls
            };

            return Ok(new
            {
                message = "Post created successfully",
                data = response
            });
        }

        // ✅ View all posts
        [HttpGet("view-all")]
        public async Task<IActionResult> ViewAllPosts()
        {
            var posts = await _context.Posts
                .Include(p => p.Account)
                .Include(p => p.ForumCategory)
                .Include(p => p.CommentPosts)
                .Include(p => p.PostImages)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            var postDtos = posts.Select(p => new PostDto
            {
                Id = p.Id,
                AccountId = p.AccountId,
                ForumCategoryId = p.ForumCategoryId,
                Title = p.Title,
                Contents = p.Contents,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                Status = p.Status,
                AccountName = p.Account.Email,
                ForumCategoryName = p.ForumCategory.Name,
                CommentCount = p.CommentPosts.Count,
                PostImageUrls = p.PostImages.Select(pi => pi.ImageUrl).ToList()
            }).ToList();

            return Ok(new
            {
                message = "Get all posts successfully",
                total = postDtos.Count,
                data = postDtos
            });
        }

        // ✅ View only active posts
        [HttpGet("view-active")]
        public async Task<IActionResult> ViewActivePosts()
        {
            var posts = await _context.Posts
                .Where(p => p.Status == "Active")
                .Include(p => p.Account)
                .Include(p => p.ForumCategory)
                .Include(p => p.CommentPosts)
                .Include(p => p.PostImages)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            var postDtos = posts.Select(p => new PostDto
            {
                Id = p.Id,
                AccountId = p.AccountId,
                ForumCategoryId = p.ForumCategoryId,
                Title = p.Title,
                Contents = p.Contents,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                Status = p.Status,
                AccountName = p.Account.Fullname,
                ForumCategoryName = p.ForumCategory.Name,
                CommentCount = p.CommentPosts.Count,
                PostImageUrls = p.PostImages.Select(pi => pi.ImageUrl).ToList()
            }).ToList();

            return Ok(new
            {
                message = "Get active posts successfully",
                total = postDtos.Count,
                data = postDtos
            });
        }

        // ✅ View my posts (by AccountId)
        [HttpGet("my-posts/{accountId}")]
        public async Task<IActionResult> ViewMyPosts(Guid accountId, [FromQuery] bool includeInactive = false)
        {
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == accountId);
            if (account == null)
                return NotFound(new { message = "Account not found" });

            var query = _context.Posts
                .Include(p => p.ForumCategory)
                .Include(p => p.CommentPosts)
                .Include(p => p.PostImages)
                .Where(p => p.AccountId == accountId)
                .AsQueryable();

            if (!includeInactive)
                query = query.Where(p => p.Status == "Active");

            var posts = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();

            var postDtos = posts.Select(p => new PostDto
            {
                Id = p.Id,
                AccountId = p.AccountId,
                ForumCategoryId = p.ForumCategoryId,
                Title = p.Title,
                Contents = p.Contents,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                Status = p.Status,
                AccountName = account.Email,
                ForumCategoryName = p.ForumCategory.Name,
                CommentCount = p.CommentPosts.Count,
                PostImageUrls = p.PostImages.Select(pi => pi.ImageUrl).ToList()
            }).ToList();

            return Ok(new
            {
                message = "Get my posts successfully",
                total = postDtos.Count,
                data = postDtos
            });
        }

        // ✅ View post by ID
        [HttpGet("{postId}")]
        public async Task<IActionResult> GetPostById(Guid postId)
        {
            var post = await _context.Posts
                .Include(p => p.ForumCategory)
                .Include(p => p.CommentPosts)
                .Include(p => p.PostImages)
                .Include(p => p.Account)
                .FirstOrDefaultAsync(p => p.Id == postId);

            if (post == null)
                return NotFound(new { message = "Post not found" });

            var dto = new PostDto
            {
                Id = post.Id,
                AccountId = post.AccountId,
                ForumCategoryId = post.ForumCategoryId,
                Title = post.Title,
                Contents = post.Contents,
                CreatedAt = post.CreatedAt,
                UpdatedAt = post.UpdatedAt,
                Status = post.Status,
                AccountName = post.Account.Email,
                ForumCategoryName = post.ForumCategory.Name,
                CommentCount = post.CommentPosts.Count,
                PostImageUrls = post.PostImages.Select(pi => pi.ImageUrl).ToList()
            };

            return Ok(new
            {
                message = "Get post detail successfully",
                data = dto
            });
        }
    }
}
