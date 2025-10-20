using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class AnswerBank
{
    public Guid Id { get; set; }

    public Guid QuestionBankId { get; set; }

    public string? AnswerName { get; set; }

    public bool IsCorrect { get; set; }

    public virtual QuestionBank QuestionBank { get; set; } = null!;

    public virtual ICollection<QuizAnswerSubmission> QuizAnswerSubmissions { get; set; } = new List<QuizAnswerSubmission>();
}
