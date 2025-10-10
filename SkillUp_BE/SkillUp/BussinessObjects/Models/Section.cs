using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Section
{
    public Guid Id { get; set; }

    public Guid CourseId { get; set; }

    public string? Title { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public bool IsActive { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual ICollection<Lecture> Lectures { get; set; } = new List<Lecture>();

    public virtual ICollection<QuestionBank> QuestionBanks { get; set; } = new List<QuestionBank>();

    public virtual ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
}
