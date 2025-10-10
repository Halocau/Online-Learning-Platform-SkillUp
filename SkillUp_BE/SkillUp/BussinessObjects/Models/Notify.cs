using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Notify
{
    public Guid Id { get; set; }

    public Guid AccountId { get; set; }

    public string Title { get; set; } = null!;

    public string Contents { get; set; } = null!;

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual Account Account { get; set; } = null!;
}
