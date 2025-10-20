using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class LikeCommentLesson
{
    public int Id { get; set; }

    public Guid CommentLessonId { get; set; }

    public Guid AccountId { get; set; }

    public bool Status { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual CommentLesson CommentLesson { get; set; } = null!;
}
