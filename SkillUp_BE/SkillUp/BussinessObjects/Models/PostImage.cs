using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class PostImage
{
    public Guid Id { get; set; }

    public Guid PostId { get; set; }

    public string ImageUrl { get; set; } = null!;

    public virtual Post Post { get; set; } = null!;
}
