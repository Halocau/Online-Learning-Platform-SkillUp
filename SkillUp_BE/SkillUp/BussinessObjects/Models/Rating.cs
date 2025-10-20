using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Rating
{
    public int Id { get; set; }

    public Guid StudentId { get; set; }

    public Guid CourseId { get; set; }

    public string? Contents { get; set; }

    public int? Star { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual Student Student { get; set; } = null!;
}
