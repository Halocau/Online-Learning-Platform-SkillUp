using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Asset
{
    public Guid Id { get; set; }

    public Guid LectureId { get; set; }

    public string? Url { get; set; }

    public bool IsActive { get; set; }

    public virtual Lecture Lecture { get; set; } = null!;
}
