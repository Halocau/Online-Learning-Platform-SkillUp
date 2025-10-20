using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Asset
{
    public Guid Id { get; set; }

    public Guid LessonId { get; set; }

    public string? Url { get; set; }

    public bool IsActive { get; set; }

    public virtual Lesson Lesson { get; set; } = null!;
}
