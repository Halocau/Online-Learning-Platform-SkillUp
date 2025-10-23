using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class ReportPost
{
    public Guid Id { get; set; }

    public Guid PostId { get; set; }

    public Guid AccountId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string? Description { get; set; }

    public string Status { get; set; } = null!;

    public virtual Account Account { get; set; } = null!;

    public virtual Post Post { get; set; } = null!;
}
