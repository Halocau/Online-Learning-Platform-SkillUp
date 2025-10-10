using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Account
{
    public Guid Id { get; set; }

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public string? Fullname { get; set; }

    public string? Phone { get; set; }

    public string? Gender { get; set; }

    public DateOnly? Dob { get; set; }

    public string? Avatar { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public string Status { get; set; } = null!;

    public int? RoleId { get; set; }

    public virtual Cart? Cart { get; set; }

    public virtual ICollection<CommentReport> CommentReports { get; set; } = new List<CommentReport>();

    public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    public virtual ICollection<LecturerApplication> LecturerApplications { get; set; } = new List<LecturerApplication>();

    public virtual ICollection<Like> Likes { get; set; } = new List<Like>();

    public virtual ICollection<Notify> Notifies { get; set; } = new List<Notify>();

    public virtual ICollection<Otp> Otps { get; set; } = new List<Otp>();

    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();

    public virtual ICollection<QuestionBank> QuestionBanks { get; set; } = new List<QuestionBank>();

    public virtual ICollection<QuizSubmission> QuizSubmissions { get; set; } = new List<QuizSubmission>();

    public virtual ICollection<Rating> Ratings { get; set; } = new List<Rating>();

    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    public virtual Role? Role { get; set; }

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
