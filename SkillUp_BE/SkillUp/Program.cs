using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Options;
using SkillUp.Bussiness.Services;
using SkillUp.BussinessObjects.Models;
using SkillUp.Configuration;
using SkillUp.Hubs;
using SkillUp.Repositories.Implementations;
using SkillUp.Repositories.Interfaces;
using SkillUp.Services.Common;
using SkillUp.Services.Implementations;
using SkillUp.Services.Interfaces;
using SkillUp.Services.Rag.Embedding;
using SkillUp.Services.Rag.Subtitle;
using SkillUp.Services.Rag.Chat;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Net.Http.Headers;
using SkillUp.BusinessLogic.Services;
using SkillUp.DataAccess.Repositories;

// Clear default claim type mappings để giữ nguyên custom claim types
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();

var builder = WebApplication.CreateBuilder(args);

// Configure request size limits for file uploads (up to 100MB)
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 100 * 1024 * 1024; // 100MB
    options.ValueLengthLimit = int.MaxValue;
    options.ValueCountLimit = int.MaxValue;
});

builder.Services.AddControllers(options =>
{
    // Increase request body size limit to 100MB
    options.MaxModelBindingCollectionSize = int.MaxValue;
});
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddHttpClient();
builder.Services.Configure<GenSubOptions>(builder.Configuration.GetSection("GenSub"));
builder.Services.Configure<GeminiOptions>(builder.Configuration.GetSection("Gemini"));
builder.Services.Configure<QdrantOptions>(builder.Configuration.GetSection("Qdrant"));
builder.Services.Configure<RagOptions>(builder.Configuration.GetSection("Rag"));
builder.Services.Configure<OllamaOptions>(builder.Configuration.GetSection("Ollama"));

builder.Services.AddHttpClient(nameof(QdrantService), (sp, client) =>
{
    var options = sp.GetRequiredService<IOptions<QdrantOptions>>().Value ?? new QdrantOptions();
    var endpoint = string.IsNullOrWhiteSpace(options.Endpoint)
        ? "https://08d02dbc-fd71-4d4a-80e4-4194b2c14301.europe-west3-0.gcp.cloud.qdrant.io"
        : options.Endpoint;

    client.BaseAddress = new Uri(endpoint.TrimEnd('/') + "/");
    client.DefaultRequestHeaders.Accept.Clear();
    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

    if (!string.IsNullOrWhiteSpace(options.ApiKey))
    {
        client.DefaultRequestHeaders.Remove("api-key");
        client.DefaultRequestHeaders.Add("api-key", options.ApiKey);
    }
});

// Configure Swagger with JWT Authentication
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "SkillUp API",
        Version = "v1",
        Description = "API for SkillUp Learning Platform"
    });

    // Add JWT Authentication to Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT token vào ô bên dưới."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Add DbContext
builder.Services.AddDbContext<SkillUpContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// Add SignalR with CORS support
builder.Services.AddSignalR(options =>
{
    options.EnableDetailedErrors = true;
});

// Add HttpContextAccessor
builder.Services.AddHttpContextAccessor();

// Register Repositories
builder.Services.AddScoped<IAccountRepository, AccountRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<ILecturerApplicationRepository, LecturerApplicationRepository>();
builder.Services.AddScoped<IOtpRepository, OtpRepository>();
builder.Services.AddScoped<INewsRepository, NewsRepository>();
builder.Services.AddScoped<ITicketRepository, TicketRepository>();
builder.Services.AddScoped<ILecturerApplicationRepository, LecturerApplicationRepository>();
builder.Services.AddScoped<ILecturerRepository, LecturerRepository>();
builder.Services.AddScoped<IBannerRepository, BannerRepository>();
builder.Services.AddScoped<ICourseRepository, CourseRepository>();
builder.Services.AddScoped<IQuizRepository, QuizRepository>();
builder.Services.AddScoped<ISectionRepository, SectionRepository>();
builder.Services.AddScoped<IVoucherRepository, VoucherRepository>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<IQuestionBankRepository, QuestionBankRepository>();
builder.Services.AddScoped<IQuestionBankRepository, QuestionBankRepository>();
builder.Services.AddScoped<ILessonRepository, LessonRepository>();
builder.Services.AddScoped<IQuestionQuizRepository, QuestionQuizRepository>();
builder.Services.AddScoped<IQuizSubmissionRepository, QuizSubmissionRepository>();
builder.Services.AddScoped<IStudentSelectedAnswersRepository, StudentSelectedAnswersRepository>();
builder.Services.AddScoped<IQuizAnswerSubmissionRepository, QuizAnswerSubmissionRepository>();
builder.Services.AddScoped<IAnswerBankRepository, AnswerBankRepository>();
builder.Services.AddScoped<IStudentProgressRepository, StudentProgressRepository>();
builder.Services.AddScoped<IEnrollmentRepository, EnrollmentRepository>();
builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
builder.Services.AddScoped<ILecturerDashRepository, LecturerDashRepository>();
builder.Services.AddScoped<IPayrollRepository, PayrollRepository>();
builder.Services.AddScoped<IModeratorContentRepository, ModeratorContentRepository>();
builder.Services.AddScoped<ISysModDashRepository, SysModDashRepository>();

// Register Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();
builder.Services.AddScoped<FtpVideoUploadService>();
builder.Services.AddScoped<IPayOSService, PayOSService>();
builder.Services.AddScoped<INewsService, NewsService>();
builder.Services.AddScoped<ITicketService, TicketService>();
builder.Services.AddScoped<ILecturerApplicationService, LecturerApplicationService>();
builder.Services.AddScoped<ILecturerService, LecturerService>();
builder.Services.AddScoped<IHomePageService, HomePageService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IQuizService, QuizService>();
builder.Services.AddScoped<IVoucherService, VoucherService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IQuestionService, QuestionService>();
builder.Services.AddScoped<IQuestionBankService, QuestionBankService>();
builder.Services.AddScoped<GenSubService>();
builder.Services.AddScoped<IQdrantService, QdrantService>();
builder.Services.AddScoped<ISubtitleService, SubtitleService>();
// Embedding Provider - Switch between Gemini and Ollama
//builder.Services.AddScoped<IEmbeddingProvider, OllamaEmbeddingProvider>();
builder.Services.AddScoped<IEmbeddingProvider, GeminiEmbeddingProvider>();
builder.Services.AddScoped<ISubtitleLessonJobService, SubtitleLessonJobService>();
builder.Services.AddScoped<ISubtitleCourseJobService, SubtitleCourseJobService>();
builder.Services.AddScoped<IAiSupportBackgroundJobService, AiSupportBackgroundJobService>();
builder.Services.AddScoped<ILessonService, LessonService>();
builder.Services.AddScoped<IBannerService, BannerService>();
builder.Services.AddScoped<ILessonChatService, LessonChatService>();
//ai
//builder.Services.AddScoped<IChatCompletionProvider, OllamaChatCompletionProvider>();
builder.Services.AddScoped<IChatCompletionProvider, GeminiChatCompletionProvider>();

builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<ILecturerDashboardService, LecturerDashboardService>();
builder.Services.AddScoped<IPayrollService, PayrollService>();
builder.Services.AddScoped<ITransactionService, TransactionService>();
builder.Services.AddScoped<ILecturerDashboardService, LecturerDashboardService>();
builder.Services.AddScoped<IPayrollService, PayrollService>();
builder.Services.AddScoped<IModeratorContentService, ModeratorContentService>();
builder.Services.AddScoped<ISystemModeratorDashboardService, SystemModeratorDashboardService>();

// POST
builder.Services.AddScoped<IPostRepository, PostRepository>();
builder.Services.AddScoped<IPostService, PostService>();


//SUBCATEGORY MODULE 
builder.Services.AddScoped<ISubCategoryRepository, SubCategoryRepository>();
builder.Services.AddScoped<ISubCategoryService, SubCategoryService>();

//CATEGORY
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICategoryService, CategoryService>();

//FORUM CATEGORY MODULE 
builder.Services.AddScoped<IForumCategoryRepository, ForumCategoryRepository>();
builder.Services.AddScoped<IForumCategoryService, ForumCategoryService>();

//Category
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<ICategoryService, CategoryService>();

//Subcategory
builder.Services.AddScoped<ISubCategoryRepository, SubCategoryRepository>();
builder.Services.AddScoped<ISubCategoryService, SubCategoryService>();


//Forum category
builder.Services.AddScoped<IForumCategoryRepository, ForumCategoryRepository>();
builder.Services.AddScoped<IForumCategoryService, ForumCategoryService>();


//post
builder.Services.AddScoped<IPostRepository, PostRepository>();
builder.Services.AddScoped<IPostService, PostService>();

// COMMENT POST MODULE
builder.Services.AddScoped<ICommentPostRepository, CommentPostRepository>();
builder.Services.AddScoped<ICommentPostService, CommentPostService>();


// LIKE MODULE
builder.Services.AddScoped<ILikeCommentPostRepository, LikeCommentPostRepository>();
builder.Services.AddScoped<ILikeCommentPostService, LikeCommentPostService>();

// ... (Các services khác của bạn)

builder.Services.AddScoped<ICommentReportRepository, CommentReportRepository>();
builder.Services.AddScoped<ICommentReportService, CommentReportService>();

//Section
builder.Services.AddScoped<ISectionRepository, SectionRepository>();
builder.Services.AddScoped<ISectionService, SectionService>();
// ... (builder.Build() và phần còn lại)

// --- Thêm vào khu vực Register Repositories ---
builder.Services.AddScoped<ICommentLessonRepository, CommentLessonRepository>();
builder.Services.AddScoped<ILikeCommentLessonRepository, LikeCommentLessonRepository>();
builder.Services.AddScoped<ILikeCommentLessonService, LikeCommentLessonService>();
// --- Thêm vào khu vực Register Services ---
builder.Services.AddScoped<ICommentLessonService, CommentLessonService>();

//builder.Services.AddScoped<IPostRepository, PostRepository>();
builder.Services.AddScoped<INotifyRepository, NotifyRepository>();
builder.Services.AddScoped<INotifyService, NotifyService>();

//comment lesson report
builder.Services.AddScoped<ICommentReportLessonRepository, CommentReportLessonRepository>();
builder.Services.AddScoped<ICommentReportLessonService, CommentReportLessonService>();


//rating
builder.Services.AddScoped<IRatingRepository, RatingRepository>();
builder.Services.AddScoped<IRatingService, RatingService>();

builder.Services.AddScoped<IReportCourseRepository, ReportCourseRepository>();
builder.Services.AddScoped<IReportCourseService, ReportCourseService>();

//report post
builder.Services.AddScoped<IReportPostRepository, ReportPostRepository>();
builder.Services.AddScoped<IReportPostService, ReportPostService>();

//background
builder.Services.AddSingleton<IBackgroundTaskQueue, BackgroundTaskQueue>();
builder.Services.AddHostedService<QueuedHostedService>();
// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

builder.Services.AddScoped<IVoucherTypeRepository, VoucherTypeRepository>();
builder.Services.AddScoped<IVoucherTypeService, VoucherTypeService>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.MapInboundClaims = false; // Giữ nguyên claim types, không tự động map

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!)),
        ClockSkew = TimeSpan.Zero,
        NameClaimType = "fullname",
        RoleClaimType = "roleName"
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) &&
                path.StartsWithSegments("/hubs/notification"))
            {
                context.Token = accessToken;
            }

            return Task.CompletedTask;
        }
    };
});

// cloudinary 
builder.Services.Configure<CloudinarySettings>(
    builder.Configuration.GetSection("CloudinarySettings"));


builder.Services.AddAuthorization();

////Configure CORS
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowAll", policy =>
//    {
//        policy.WithOrigins("http://localhost:5173")
//              .AllowAnyOrigin()
//              .AllowAnyMethod()
//              .AllowAnyHeader();
//    });
//});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            // Get allowed origins from configuration
            var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
                ?? new[] { "http://localhost:5173" };
            
            policy.WithOrigins(allowedOrigins)
                  .SetIsOriginAllowed(origin =>
                  {
                      // Allow localhost for development
                      if (origin.StartsWith("http://localhost") || origin.StartsWith("https://localhost"))
                          return true;
                      
                      // Allow any Vercel domain (including preview deployments)
                      if (origin.Contains("vercel.app"))
                          return true;
                      
                      // Check against configured allowed origins
                      return allowedOrigins.Contains(origin);
                  })
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
});

// Configure Kestrel server options for large file uploads
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 100 * 1024 * 1024; // 100MB
});

var app = builder.Build();

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }
app.UseSwagger();
app.UseSwaggerUI();
// Enable serving static files from wwwroot folder
app.UseStaticFiles();

// Use CORS
app.UseCors("AllowAll");
//app.UseCors("AllowSpecificOrigin"); // Sử dụng policy đã đặt tên ở trên

// Use Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map SignalR Hubs BEFORE MapControllers to ensure proper routing
app.MapHub<NotificationHub>("/hubs/notification");
app.MapHub<SkillUp.Hubs.CommentHub>("/commentHub");
app.MapHub<LikeCommentHub>("/hubs/likeCommentHub");
app.MapHub<CommentLessonHub>("/commentLessonHub");
app.MapHub<LikeCommentHub>("/hubs/likeComment");

app.MapControllers();


app.Run();
