using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class QuizSubmission
{
    public Guid Id { get; set; }

    public Guid QuizId { get; set; }

    public Guid StudentId { get; set; }

    public decimal? Score { get; set; }

    public DateTime StartedAt { get; set; }

    public DateTime? EndedAt { get; set; }

    public virtual Quiz Quiz { get; set; } = null!;

    public virtual ICollection<QuizAnswerSubmission> QuizAnswerSubmissions { get; set; } = new List<QuizAnswerSubmission>();

    public virtual Student Student { get; set; } = null!;
}
