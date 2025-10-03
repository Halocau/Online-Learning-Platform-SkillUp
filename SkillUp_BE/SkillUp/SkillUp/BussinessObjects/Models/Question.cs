using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Question
{
    public Guid Id { get; set; }

    public Guid QuizId { get; set; }

    public string? QuestionName { get; set; }

    public virtual Quiz Quiz { get; set; } = null!;

    public virtual ICollection<QuizAnswerSubmission> QuizAnswerSubmissions { get; set; } = new List<QuizAnswerSubmission>();

    public virtual ICollection<QuizAnswer> QuizAnswers { get; set; } = new List<QuizAnswer>();
}
