using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class News
{
    public Guid Id { get; set; }

    public string Email { get; set; } = null!;

    public string? Title { get; set; }

    public string? Contents { get; set; }

    public DateOnly? Date { get; set; }

    public virtual ICollection<NewsImage> NewsImages { get; set; } = new List<NewsImage>();
}
