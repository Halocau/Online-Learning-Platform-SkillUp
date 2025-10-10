using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Ticket
{
    public Guid Id { get; set; }

    public Guid AccountId { get; set; }

    public string? Title { get; set; }

    public string? Contents { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? Status { get; set; }

    public virtual Account Account { get; set; } = null!;
}
