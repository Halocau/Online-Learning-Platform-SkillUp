using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class CommentReportPost
{
    public Guid Id { get; set; }

    public string Reason { get; set; } = null!;

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public Guid AccountId { get; set; }

    public Guid CommentPostId { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual CommentPost CommentPost { get; set; } = null!;
}
