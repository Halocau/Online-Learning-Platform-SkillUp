using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class StudentSelectedAnswer
{
    public Guid AnswerBankId { get; set; }

    public Guid QuizAnswerSubmissionId { get; set; }

    public Guid Id { get; set; }

    public virtual AnswerBank AnswerBank { get; set; } = null!;

    public virtual QuizAnswerSubmission QuizAnswerSubmission { get; set; } = null!;
}
