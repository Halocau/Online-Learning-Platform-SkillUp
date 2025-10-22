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

        // POST: api/Post/create
        [HttpPost("create")]
        public async Task<IActionResult> CreatePost([FromForm] PostCreateRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Kiểm tra tài khoản và danh mục
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == request.AccountId);
            var category = await _context.ForumCategories.FirstOrDefaultAsync(fc => fc.Id == request.ForumCategoryId);

            if (account == null)
                return NotFound(new { message = "Account not found" });

            if (category == null)
                return NotFound(new { message = "Forum category not found" });

            // Tạo bài viết mới
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

            // Upload ảnh nếu có
            var imageUrls = new List<string>();
            if (request.Images != null && request.Images.Count > 0)
            {
                foreach (var image in request.Images)
                {
                    var imageUrl = await _cloudinaryService.UploadImageAsync(image, "skillup/posts");
                    imageUrls.Add(imageUrl);

                    // Lưu vào bảng PostImage
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

            // Chuẩn bị dữ liệu trả về
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
    
    //Get all pót
    [HttpGet("view-all")]
    public async Task<IActionResult> ViewAllPosts([FromQuery] bool includeInactive = false)
    {
        var query = _context.Posts
            .Include(p => p.Account)
            .Include(p => p.ForumCategory)
            .Include(p => p.CommentPosts)
            .Include(p => p.PostImages)
            .AsQueryable();

        // Chỉ lấy bài "Active" nếu không yêu cầu khác
        if (!includeInactive)
            query = query.Where(p => p.Status == "Active");

        var posts = await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        // Map sang DTO
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
            AccountName = p.Account.Email, // hoặc p.Account.FullName nếu có
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
        // ✅ VIEW MY POSTS (lọc theo AccountId)
        [HttpGet("my-posts/{accountId}")]
        public async Task<IActionResult> ViewMyPosts(Guid accountId, [FromQuery] bool includeInactive = false)
        {
            // Kiểm tra account tồn tại
            var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == accountId);
            if (account == null)
                return NotFound(new { message = "Account not found" });

            // Truy vấn danh sách post thuộc về account này
            var query = _context.Posts
                .Include(p => p.ForumCategory)
                .Include(p => p.CommentPosts)
                .Include(p => p.PostImages)
                .Where(p => p.AccountId == accountId)
                .AsQueryable();

            // Nếu không yêu cầu includeInactive thì chỉ lấy post có Status = Active
            if (!includeInactive)
                query = query.Where(p => p.Status == "Active");

            // Sắp xếp: mới nhất trước
            var posts = await query
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            // Map sang DTO
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
                AccountName = account.Email, // hoặc account.FullName nếu có
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


    //View post list user
    [HttpGet("user/{accountId}")]
    public async Task<IActionResult> ViewUserPosts(Guid accountId, [FromQuery] bool includeInactive = false)
    {
        // Kiểm tra người dùng có tồn tại không
        var account = await _context.Accounts.FirstOrDefaultAsync(a => a.Id == accountId);
        if (account == null)
            return NotFound(new { message = "User not found" });

        // Lấy danh sách bài viết của user này
        var query = _context.Posts
            .Include(p => p.ForumCategory)
            .Include(p => p.CommentPosts)
            .Include(p => p.PostImages)
            .Where(p => p.AccountId == accountId)
            .AsQueryable();

        // Chỉ lấy post Active nếu không có includeInactive
        if (!includeInactive)
            query = query.Where(p => p.Status == "Active");

        // Sắp xếp bài viết theo thời gian đăng mới nhất
        var posts = await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();

        // Map sang DTO
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
            AccountName = account.Email, // hoặc account.FullName nếu có
            ForumCategoryName = p.ForumCategory.Name,
            CommentCount = p.CommentPosts.Count,
            PostImageUrls = p.PostImages.Select(pi => pi.ImageUrl).ToList()
        }).ToList();

        return Ok(new
        {
            message = "Get user posts successfully",
            total = postDtos.Count,
            data = postDtos
        });
        }
    }
}