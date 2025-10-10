using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class CourseImage
{
    public Guid Id { get; set; }

    public Guid CourseId { get; set; }

    public string ImageUrl { get; set; } = null!;

    public virtual Course Course { get; set; } = null!;
}
