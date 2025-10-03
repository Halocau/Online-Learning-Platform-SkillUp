using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class NewImage
{
    public Guid Id { get; set; }

    public Guid NewId { get; set; }

    public string ImageUrl { get; set; } = null!;

    public virtual News New { get; set; } = null!;
}
