using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Like
{
    public int Id { get; set; }

    public Guid CommentId { get; set; }

    public Guid AccountId { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual Comment Comment { get; set; } = null!;
}
