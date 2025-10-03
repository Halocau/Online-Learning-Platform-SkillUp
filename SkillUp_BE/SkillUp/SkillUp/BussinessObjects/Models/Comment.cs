using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Comment
{
    public Guid Id { get; set; }

    public Guid AccountId { get; set; }

    public string Contents { get; set; } = null!;

    public Guid? ParentCommentId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public Guid EntityId { get; set; }

    public string EntityType { get; set; } = null!;

    public virtual Account Account { get; set; } = null!;

    public virtual ICollection<CommentReport> CommentReports { get; set; } = new List<CommentReport>();

    public virtual ICollection<Comment> InverseParentComment { get; set; } = new List<Comment>();

    public virtual ICollection<Like> Likes { get; set; } = new List<Like>();

    public virtual Comment? ParentComment { get; set; }
}
