using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class QuizAnswer
{
    public Guid Id { get; set; }

    public Guid QuestionId { get; set; }

    public string? AnswerName { get; set; }

    public bool IsCorrect { get; set; }

    public virtual Question Question { get; set; } = null!;

    public virtual ICollection<QuizAnswerSubmission> QuizAnswerSubmissions { get; set; } = new List<QuizAnswerSubmission>();
}
