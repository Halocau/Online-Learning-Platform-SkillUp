using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class News
{
    public Guid Id { get; set; }

    public Guid AccountId { get; set; }

    public string? Title { get; set; }

    public string? Contents { get; set; }

    public DateOnly? Date { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual ICollection<NewImage> NewImages { get; set; } = new List<NewImage>();
}
