using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Quiz
{
    public Guid Id { get; set; }

    public Guid SectionId { get; set; }

    public string? Title { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public bool IsActive { get; set; }

    public int? PassPercent { get; set; }

    public virtual ICollection<Question> Questions { get; set; } = new List<Question>();

    public virtual ICollection<QuizSubmission> QuizSubmissions { get; set; } = new List<QuizSubmission>();

    public virtual Section Section { get; set; } = null!;
}
