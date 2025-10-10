using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Rating
{
    public int Id { get; set; }

    public Guid AccountId { get; set; }

    public Guid CourseId { get; set; }

    public string? Contents { get; set; }

    public int? Star { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual Course Course { get; set; } = null!;
}
