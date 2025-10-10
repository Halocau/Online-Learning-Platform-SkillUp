using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class QuizAnswerSubmission
{
    public Guid Id { get; set; }

    public Guid SubmissionId { get; set; }

    public Guid QuestionBankId { get; set; }

    public Guid SelectedAnswerId { get; set; }

    public bool? IsCorrect { get; set; }

    public virtual QuestionBank QuestionBank { get; set; } = null!;

    public virtual AnswerBank SelectedAnswer { get; set; } = null!;

    public virtual QuizSubmission Submission { get; set; } = null!;
}
