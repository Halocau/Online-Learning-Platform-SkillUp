using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class CommentPost
{
    public Guid Id { get; set; }

    public Guid AccountId { get; set; }

    public string Contents { get; set; } = null!;

    public Guid? ParentCommentId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Guid PostId { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual ICollection<CommentReportPost> CommentReportPosts { get; set; } = new List<CommentReportPost>();

    public virtual ICollection<CommentPost> InverseParentComment { get; set; } = new List<CommentPost>();

    public virtual ICollection<LikeCommentPost> LikeCommentPosts { get; set; } = new List<LikeCommentPost>();

    public virtual CommentPost? ParentComment { get; set; }

    public virtual Post Post { get; set; } = null!;
}
