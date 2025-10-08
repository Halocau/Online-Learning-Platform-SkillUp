using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace SkillUp.BussinessObjects.Models;

public partial class SkillUpContext : DbContext
{
    public SkillUpContext()
    {
    }

    public SkillUpContext(DbContextOptions<SkillUpContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Account> Accounts { get; set; }

    public virtual DbSet<AccountPermission> AccountPermissions { get; set; }

    public virtual DbSet<AnswerBank> AnswerBanks { get; set; }

    public virtual DbSet<Asset> Assets { get; set; }

    public virtual DbSet<Banner> Banners { get; set; }

    public virtual DbSet<Cart> Carts { get; set; }

    public virtual DbSet<CartItem> CartItems { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Comment> Comments { get; set; }

    public virtual DbSet<CommentReport> CommentReports { get; set; }

    public virtual DbSet<Course> Courses { get; set; }

    public virtual DbSet<CourseImage> CourseImages { get; set; }

    public virtual DbSet<Enrollment> Enrollments { get; set; }

    public virtual DbSet<ForumCategory> ForumCategories { get; set; }

    public virtual DbSet<Lecture> Lectures { get; set; }

    public virtual DbSet<LecturerApplication> LecturerApplications { get; set; }

    public virtual DbSet<Like> Likes { get; set; }

    public virtual DbSet<NewImage> NewImages { get; set; }

    public virtual DbSet<News> News { get; set; }

    public virtual DbSet<Notify> Notifies { get; set; }

    public virtual DbSet<Otp> Otps { get; set; }

    public virtual DbSet<Permission> Permissions { get; set; }

    public virtual DbSet<PermissionDetail> PermissionDetails { get; set; }

    public virtual DbSet<Post> Posts { get; set; }

    public virtual DbSet<PostImage> PostImages { get; set; }

    public virtual DbSet<QuestionBank> QuestionBanks { get; set; }

    public virtual DbSet<QuestionQuiz> QuestionQuizzes { get; set; }

    public virtual DbSet<Quiz> Quizzes { get; set; }

    public virtual DbSet<QuizAnswer> QuizAnswers { get; set; }

    public virtual DbSet<QuizAnswerSubmission> QuizAnswerSubmissions { get; set; }

    public virtual DbSet<QuizSubmission> QuizSubmissions { get; set; }

    public virtual DbSet<Rating> Ratings { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<Section> Sections { get; set; }

    public virtual DbSet<SubCategory> SubCategories { get; set; }

    public virtual DbSet<Ticket> Tickets { get; set; }

    public virtual DbSet<Transaction> Transactions { get; set; }

    public virtual DbSet<TransactionDetail> TransactionDetails { get; set; }

    public virtual DbSet<Voucher> Vouchers { get; set; }

    public virtual DbSet<VoucherType> VoucherTypes { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("server=(local);database=SkillUp;uid=sa;pwd=123;Encrypt=false");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Account>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Account__3214EC076DFB9FE6");

            entity.ToTable("Account");

            entity.HasIndex(e => e.Email, "UQ__Account__A9D1053471E03F71").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Avatar).IsUnicode(false);
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Fullname).HasMaxLength(255);
            entity.Property(e => e.Gender)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Phone)
                .HasMaxLength(12)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasDefaultValue("Inactive");
        });

        modelBuilder.Entity<AccountPermission>(entity =>
        {
            entity.ToTable("AccountPermission");

            entity.HasOne(d => d.Account).WithMany(p => p.AccountPermissions)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_AccountPermission_Account");

            entity.HasOne(d => d.Permission).WithMany(p => p.AccountPermissions)
                .HasForeignKey(d => d.PermissionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_AccountPermission_Permission");
        });

        modelBuilder.Entity<AnswerBank>(entity =>
        {
            entity.ToTable("AnswerBank");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.AnswerName).HasMaxLength(255);

            entity.HasOne(d => d.QuestionBank).WithMany(p => p.AnswerBanks)
                .HasForeignKey(d => d.QuestionBankId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_AnswerBank_QuestionBank");
        });

        modelBuilder.Entity<Asset>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Asset__3214EC07EFDF1467");

            entity.ToTable("Asset");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.Lecture).WithMany(p => p.Assets)
                .HasForeignKey(d => d.LectureId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Asset_Lecture");
        });

        modelBuilder.Entity<Banner>(entity =>
        {
            entity.ToTable("Banner");

            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Hyperlink)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Image).IsUnicode(false);
            entity.Property(e => e.Title).HasMaxLength(255);
        });

        modelBuilder.Entity<Cart>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Cart__3214EC07901B86FE");

            entity.ToTable("Cart");

            entity.HasIndex(e => e.AccountId, "UQ__Cart__349DA5A799245AEB").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");

            entity.HasOne(d => d.Account).WithOne(p => p.Cart)
                .HasForeignKey<Cart>(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cart_Account");
        });

        modelBuilder.Entity<CartItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__CartItem__3214EC07F923177E");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Cart).WithMany(p => p.CartItems)
                .HasForeignKey(d => d.CartId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CartItems_Cart");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Category__3214EC07F91DC404");

            entity.ToTable("Category");

            entity.Property(e => e.IsActive)
                .IsRequired()
                .HasDefaultValueSql("('Active')");
            entity.Property(e => e.Name).HasMaxLength(255);
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Comment__3214EC07A957FFD4");

            entity.ToTable("Comment");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.EntityType)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.ParentComment).WithMany(p => p.InverseParentComment)
                .HasForeignKey(d => d.ParentCommentId)
                .HasConstraintName("FK_Comment_Comment");
        });

        modelBuilder.Entity<CommentReport>(entity =>
        {
            entity.ToTable("CommentReport");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.Reason).HasMaxLength(500);
            entity.Property(e => e.Status)
                .HasMaxLength(15)
                .IsUnicode(false);

            entity.HasOne(d => d.Account).WithMany(p => p.CommentReports)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CommentReport_Account");

            entity.HasOne(d => d.Comment).WithMany(p => p.CommentReports)
                .HasForeignKey(d => d.CommentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CommentReport_Comment");
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Course__3214EC071FD93751");

            entity.ToTable("Course");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Image).IsUnicode(false);
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.Rating).HasDefaultValue(0.0);
            entity.Property(e => e.Status)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("Draft");
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Category).WithMany(p => p.Courses)
                .HasForeignKey(d => d.CategoryId)
                .HasConstraintName("FK_Course_Category");
        });

        modelBuilder.Entity<CourseImage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__CourseIm__3214EC07A1ECAAD3");

            entity.ToTable("CourseImage");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");

            entity.HasOne(d => d.Course).WithMany(p => p.CourseImages)
                .HasForeignKey(d => d.CourseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CourseImage_Course");
        });

        modelBuilder.Entity<Enrollment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Enrollme__3214EC0783BD5100");

            entity.ToTable("Enrollment");

            entity.HasIndex(e => new { e.AccountId, e.CourseId }, "UQ__Enrollme__580F72BD9A06D074").IsUnique();

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CompletedAt).HasColumnType("datetime");
            entity.Property(e => e.EnrolledAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Account).WithMany(p => p.Enrollments)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Enrollment_Account");

            entity.HasOne(d => d.Course).WithMany(p => p.Enrollments)
                .HasForeignKey(d => d.CourseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Enrollment_Course");
        });

        modelBuilder.Entity<ForumCategory>(entity =>
        {
            entity.ToTable("ForumCategory");

            entity.Property(e => e.Name).HasMaxLength(255);
        });

        modelBuilder.Entity<Lecture>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Lecture__3214EC07B6B95360");

            entity.ToTable("Lecture");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Type).HasMaxLength(50);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Section).WithMany(p => p.Lectures)
                .HasForeignKey(d => d.SectionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Lecture_Section");
        });

        modelBuilder.Entity<LecturerApplication>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Lecturer__3214EC07C36A8885");

            entity.ToTable("LecturerApplication");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Cv)
                .IsUnicode(false)
                .HasColumnName("CV");
            entity.Property(e => e.Degree).IsUnicode(false);
            entity.Property(e => e.Reason).HasMaxLength(255);
            entity.Property(e => e.Status)
                .HasMaxLength(10)
                .IsUnicode(false)
                .HasDefaultValue("Pending");

            entity.HasOne(d => d.Account).WithMany(p => p.LecturerApplications)
                .HasForeignKey(d => d.AccountId)
                .HasConstraintName("FK_LecturerApplication_Account");
        });

        modelBuilder.Entity<Like>(entity =>
        {
            entity.ToTable("Like");

            entity.HasOne(d => d.Account).WithMany(p => p.Likes)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Like_Account");

            entity.HasOne(d => d.Comment).WithMany(p => p.Likes)
                .HasForeignKey(d => d.CommentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Like_Comment");
        });

        modelBuilder.Entity<NewImage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__NewImage__3214EC07A76F4C1B");

            entity.ToTable("NewImage");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");

            entity.HasOne(d => d.New).WithMany(p => p.NewImages)
                .HasForeignKey(d => d.NewId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_NewImage_News");
        });

        modelBuilder.Entity<News>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__News__3214EC075ED16F6C");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Title).HasMaxLength(255);
        });

        modelBuilder.Entity<Notify>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Notify__3214EC07DDA0E4F0");

            entity.ToTable("Notify");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasDefaultValue("Unread");
            entity.Property(e => e.Title).HasMaxLength(255);

            entity.HasOne(d => d.Account).WithMany(p => p.Notifies)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notify_Account");
        });

        modelBuilder.Entity<Otp>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Otp__3214EC07");

            entity.ToTable("Otp");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.OtpExpiry).HasColumnType("datetime");
            entity.Property(e => e.OtpLink).HasMaxLength(100);

            entity.HasOne(d => d.Account).WithMany(p => p.Otps)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Otp_Account");
        });

        modelBuilder.Entity<Permission>(entity =>
        {
            entity.ToTable("Permission");

            entity.Property(e => e.Name).HasMaxLength(255);
        });

        modelBuilder.Entity<PermissionDetail>(entity =>
        {
            entity.ToTable("PermissionDetail");

            entity.Property(e => e.ActionCode)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ActionName).HasMaxLength(255);

            entity.HasOne(d => d.Permission).WithMany(p => p.PermissionDetails)
                .HasForeignKey(d => d.PermissionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PermissionDetail_Permission");
        });

        modelBuilder.Entity<Post>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Post__3214EC077CA146E3");

            entity.ToTable("Post");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasMaxLength(15)
                .IsUnicode(false)
                .HasDefaultValue("Inactive");
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.Account).WithMany(p => p.Posts)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Post_Account");

            entity.HasOne(d => d.ForumCategory).WithMany(p => p.Posts)
                .HasForeignKey(d => d.ForumCategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Post_ForumCategory");
        });

        modelBuilder.Entity<PostImage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__PostImag__3214EC0702A0AA6B");

            entity.ToTable("PostImage");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");

            entity.HasOne(d => d.Post).WithMany(p => p.PostImages)
                .HasForeignKey(d => d.PostId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_PostImage_Post");
        });

        modelBuilder.Entity<QuestionBank>(entity =>
        {
            entity.ToTable("QuestionBank");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.Course).WithMany(p => p.QuestionBanks)
                .HasForeignKey(d => d.CourseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QuestionBank_Course");

            entity.HasOne(d => d.Section).WithMany(p => p.QuestionBanks)
                .HasForeignKey(d => d.SectionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QuestionBank_Section");
        });

        modelBuilder.Entity<QuestionQuiz>(entity =>
        {
            entity.ToTable("QuestionQuiz");

            entity.Property(e => e.Id).ValueGeneratedNever();

            entity.HasOne(d => d.QuestionBank).WithMany(p => p.QuestionQuizzes)
                .HasForeignKey(d => d.QuestionBankId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QuestionQuiz_QuestionBank");

            entity.HasOne(d => d.Quiz).WithMany(p => p.QuestionQuizzes)
                .HasForeignKey(d => d.QuizId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QuestionQuiz_QuizSubmission");
        });

        modelBuilder.Entity<Quiz>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Quiz__3214EC0701E7A384");

            entity.ToTable("Quiz");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Section).WithMany(p => p.Quizzes)
                .HasForeignKey(d => d.SectionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Quiz_Section");
        });

        modelBuilder.Entity<QuizAnswer>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__QuizAnsw__3214EC0791B39958");

            entity.ToTable("QuizAnswer");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.AnswerName).HasMaxLength(255);

            entity.HasOne(d => d.QuestionBank).WithMany(p => p.QuizAnswers)
                .HasForeignKey(d => d.QuestionBankId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QuizAnswer_QuestionBank");
        });

        modelBuilder.Entity<QuizAnswerSubmission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__QuizAnsw__3214EC07B0327BF3");

            entity.ToTable("QuizAnswerSubmission");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");

            entity.HasOne(d => d.QuestionBank).WithMany(p => p.QuizAnswerSubmissions)
                .HasForeignKey(d => d.QuestionBankId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QuizAnswerSubmission_QuestionBank");

            entity.HasOne(d => d.Submission).WithMany(p => p.QuizAnswerSubmissions)
                .HasForeignKey(d => d.SubmissionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QuizAnswerSubmission_QuizSubmission");
        });

        modelBuilder.Entity<QuizSubmission>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__QuizSubm__3214EC07A94B0ED3");

            entity.ToTable("QuizSubmission");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.EndedAt).HasColumnType("datetime");
            entity.Property(e => e.Score).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.StartedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Account).WithMany(p => p.QuizSubmissions)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QuizSubmission_Account");

            entity.HasOne(d => d.Quiz).WithMany(p => p.QuizSubmissions)
                .HasForeignKey(d => d.QuizId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QuizSubmission_Quiz");
        });

        modelBuilder.Entity<Rating>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Rating__3214EC0722C04234");

            entity.ToTable("Rating");

            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Account).WithMany(p => p.Ratings)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Rating_Account");

            entity.HasOne(d => d.Course).WithMany(p => p.Ratings)
                .HasForeignKey(d => d.CourseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Rating_Course");
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CreatedUtc).HasColumnType("datetime");
            entity.Property(e => e.ExpiresUtc).HasColumnType("datetime");
            entity.Property(e => e.RevokedUtc).HasColumnType("datetime");
            entity.Property(e => e.Token)
                .HasMaxLength(450)
                .IsUnicode(false);

            entity.HasOne(d => d.Account).WithMany(p => p.RefreshTokens)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_RefreshTokens_Account");
        });

        modelBuilder.Entity<Section>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Section__3214EC07F0F74A07");

            entity.ToTable("Section");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Title).HasMaxLength(255);
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
        });

        modelBuilder.Entity<SubCategory>(entity =>
        {
            entity.ToTable("SubCategory");

            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Name).HasMaxLength(255);

            entity.HasOne(d => d.Category).WithMany(p => p.SubCategories)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SubCategory_Category");
        });

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Ticket__3214EC079B9F1268");

            entity.ToTable("Ticket");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Status).HasMaxLength(15);
            entity.Property(e => e.Title).HasMaxLength(255);

            entity.HasOne(d => d.Account).WithMany(p => p.Tickets)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Ticket_Account");
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Transact__3214EC07B00F053B");

            entity.ToTable("Transaction");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.PaymentMethod).HasMaxLength(50);
            entity.Property(e => e.Status).HasMaxLength(20);

            entity.HasOne(d => d.Account).WithMany(p => p.Transactions)
                .HasForeignKey(d => d.AccountId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Transaction_Account");
        });

        modelBuilder.Entity<TransactionDetail>(entity =>
        {
            entity.ToTable("TransactionDetail");

            entity.Property(e => e.Id).ValueGeneratedNever();
            entity.Property(e => e.CourseId)
                .HasMaxLength(10)
                .IsFixedLength();
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Transaction).WithMany(p => p.TransactionDetails)
                .HasForeignKey(d => d.TransactionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_TransactionDetail_Transaction");
        });

        modelBuilder.Entity<Voucher>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Voucher__3214EC078E8D67B6");

            entity.ToTable("Voucher");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CouponCode)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.EndTime).HasColumnType("datetime");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.StartTime).HasColumnType("datetime");

            entity.HasOne(d => d.Course).WithMany(p => p.Vouchers)
                .HasForeignKey(d => d.CourseId)
                .HasConstraintName("FK_Voucher_Course");

            entity.HasOne(d => d.VourcherTypeNavigation).WithMany(p => p.Vouchers)
                .HasForeignKey(d => d.VourcherType)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Voucher_VoucherType");
        });

        modelBuilder.Entity<VoucherType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__VoucherT__3214EC07860BE4E5");

            entity.ToTable("VoucherType");

            entity.Property(e => e.Name)
                .HasMaxLength(15)
                .IsUnicode(false);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
