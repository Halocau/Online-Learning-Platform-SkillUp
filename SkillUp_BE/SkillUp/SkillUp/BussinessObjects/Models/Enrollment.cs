using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Enrollment
{
    public Guid Id { get; set; }

    public Guid AccountId { get; set; }

    public Guid CourseId { get; set; }

    public DateTime EnrolledAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual Course Course { get; set; } = null!;
}
