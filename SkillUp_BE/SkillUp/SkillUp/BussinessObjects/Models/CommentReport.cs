using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class CommentReport
{
    public Guid Id { get; set; }

    public string Reason { get; set; } = null!;

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public Guid AccountId { get; set; }

    public Guid CommentId { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual Comment Comment { get; set; } = null!;
}
