using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Category
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public bool? IsActive { get; set; }

    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();

    public virtual ICollection<SubCategory> SubCategories { get; set; } = new List<SubCategory>();
}
