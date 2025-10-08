using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class ForumCategory
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public bool IsActive { get; set; }

    public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
}
