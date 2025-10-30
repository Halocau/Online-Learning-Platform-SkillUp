using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class LikeCommentPost
{
    public int Id { get; set; }

    public Guid CommentPostId { get; set; }

    public Guid AccountId { get; set; }

    public bool Status { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual CommentPost CommentPost { get; set; } = null!;
}
