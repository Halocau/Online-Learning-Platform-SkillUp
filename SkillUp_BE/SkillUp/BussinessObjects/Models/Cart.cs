using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Cart
{
    public Guid Id { get; set; }

    public Guid AccountId { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}
