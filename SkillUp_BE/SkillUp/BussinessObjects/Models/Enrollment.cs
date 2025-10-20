using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Enrollment
{
    public Guid Id { get; set; }

    public Guid StudentId { get; set; }

    public Guid CourseId { get; set; }

    public DateTime EnrolledAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual Student Student { get; set; } = null!;
}
