using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class ReportCourse
{
    public Guid Id { get; set; }

    public Guid CourseId { get; set; }

    public Guid StudentId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string? Description { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual Student Student { get; set; } = null!;
}
