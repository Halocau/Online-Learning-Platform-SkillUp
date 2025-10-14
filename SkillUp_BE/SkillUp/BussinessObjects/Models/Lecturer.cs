using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Lecturer
{
    public Guid Id { get; set; }

    public Guid AccountId { get; set; }

    public string? Title { get; set; }

    public string? Profession { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    public virtual ICollection<QuestionBank> QuestionBanks { get; set; } = new List<QuestionBank>();
}
