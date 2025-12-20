using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Asset
{
    public Guid Id { get; set; }

    public Guid LessonId { get; set; }

    public string? Url { get; set; }

    public bool IsActive { get; set; }

    public string? Contents { get; set; }

    public string? FileUrl { get; set; }

    public string? SubtitleText { get; set; }

    public bool? IsSubtitleConfirmed { get; set; }

    public virtual Lesson Lesson { get; set; } = null!;
}
