using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Lecture
{
    public Guid Id { get; set; }

    public Guid SectionId { get; set; }

    public string? Type { get; set; }

    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public bool IsActive { get; set; }

    public bool IsFree { get; set; }

    public virtual ICollection<Asset> Assets { get; set; } = new List<Asset>();

    public virtual Section Section { get; set; } = null!;
}
