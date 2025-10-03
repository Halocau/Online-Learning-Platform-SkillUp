using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class QuizAnswerSubmission
{
    public Guid Id { get; set; }

    public Guid SubmissionId { get; set; }

    public Guid QuestionId { get; set; }

    public Guid SelectedAnswerId { get; set; }

    public bool? IsCorrect { get; set; }

    public virtual Question Question { get; set; } = null!;

    public virtual QuizAnswer SelectedAnswer { get; set; } = null!;

    public virtual QuizSubmission Submission { get; set; } = null!;
}
