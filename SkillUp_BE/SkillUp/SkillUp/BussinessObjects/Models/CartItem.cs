using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class CartItem
{
    public Guid Id { get; set; }

    public Guid CourseId { get; set; }

    public Guid CartId { get; set; }

    public decimal Price { get; set; }

    public virtual Cart Cart { get; set; } = null!;
}
