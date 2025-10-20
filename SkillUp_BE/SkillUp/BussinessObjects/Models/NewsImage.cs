using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class NewsImage
{
    public Guid Id { get; set; }

    public Guid NewsId { get; set; }

    public string ImageUrl { get; set; } = null!;

    public virtual News News { get; set; } = null!;
}
