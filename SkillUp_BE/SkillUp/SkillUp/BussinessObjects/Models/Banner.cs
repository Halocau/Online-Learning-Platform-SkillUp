using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Banner
{
    public int Id { get; set; }

    public string? Image { get; set; }

    public string? Hyperlink { get; set; }

    public bool IsActive { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string? Email { get; set; }
}
