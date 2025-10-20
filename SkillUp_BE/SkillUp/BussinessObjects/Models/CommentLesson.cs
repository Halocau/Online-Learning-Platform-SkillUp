using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class CommentLesson
{
    public Guid Id { get; set; }

    public Guid AccountId { get; set; }

    public Guid LessonId { get; set; }

    public Guid? ParentCommentId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string? Contents { get; set; }

    public virtual ICollection<CommentReportLesson> CommentReportLessons { get; set; } = new List<CommentReportLesson>();

    public virtual ICollection<CommentLesson> InverseParentComment { get; set; } = new List<CommentLesson>();

    public virtual ICollection<LikeCommentLesson> LikeCommentLessons { get; set; } = new List<LikeCommentLesson>();

    public virtual CommentLesson? ParentComment { get; set; }
}
