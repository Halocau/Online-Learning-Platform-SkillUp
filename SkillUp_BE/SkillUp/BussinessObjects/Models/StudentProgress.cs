using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class StudentProgress
{
    public Guid Id { get; set; }

    public Guid CourseId { get; set; }

    public Guid? LessonId { get; set; }

    public Guid? QuizId { get; set; }

    public Guid StudentId { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual Lesson? Lesson { get; set; }

    public virtual Quiz? Quiz { get; set; }

    public virtual Student Student { get; set; } = null!;
}
