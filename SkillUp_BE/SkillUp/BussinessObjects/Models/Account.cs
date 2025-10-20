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

    public virtual ICollection<CommentPost> CommentPosts { get; set; } = new List<CommentPost>();

    public virtual ICollection<CommentReportLesson> CommentReportLessons { get; set; } = new List<CommentReportLesson>();

    public virtual ICollection<CommentReportPost> CommentReportPosts { get; set; } = new List<CommentReportPost>();

    public virtual ICollection<LecturerApplication> LecturerApplications { get; set; } = new List<LecturerApplication>();

    public virtual ICollection<Lecturer> Lecturers { get; set; } = new List<Lecturer>();

    public virtual ICollection<LikeCommentLesson> LikeCommentLessons { get; set; } = new List<LikeCommentLesson>();

    public virtual ICollection<LikeCommentPost> LikeCommentPosts { get; set; } = new List<LikeCommentPost>();

    public virtual ICollection<Notify> Notifies { get; set; } = new List<Notify>();

    public virtual ICollection<Otp> Otps { get; set; } = new List<Otp>();

    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();

    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    public virtual Role? Role { get; set; }

    public virtual ICollection<Student> Students { get; set; } = new List<Student>();

    public virtual ICollection<Ticket> Tickets { get; set; } = new List<Ticket>();

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
}
