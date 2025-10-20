using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class SubCategory
{
    public int Id { get; set; }

    public int CategoryId { get; set; }

    public string Name { get; set; } = null!;

    public bool IsActive { get; set; }

    public virtual Category Category { get; set; } = null!;

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();
}
