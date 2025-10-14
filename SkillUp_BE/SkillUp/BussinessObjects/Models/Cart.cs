using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Cart
{
    public Guid Id { get; set; }

    public Guid StudentId { get; set; }

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual Student Student { get; set; } = null!;
}
