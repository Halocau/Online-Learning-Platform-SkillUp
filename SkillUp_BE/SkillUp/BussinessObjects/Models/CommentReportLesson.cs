using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class CommentReportLesson
{
    public Guid Id { get; set; }

    public Guid AccountId { get; set; }

    public Guid CommentLessonId { get; set; }

    public string Reason { get; set; } = null!;

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual CommentLesson CommentLesson { get; set; } = null!;
}
