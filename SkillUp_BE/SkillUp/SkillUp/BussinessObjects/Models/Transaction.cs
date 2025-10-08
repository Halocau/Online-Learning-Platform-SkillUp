using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Transaction
{
    public Guid Id { get; set; }

    public Guid AccountId { get; set; }

    public decimal Amount { get; set; }

    public string? Description { get; set; }

    public string Status { get; set; } = null!;

    public string PaymentMethod { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual ICollection<TransactionDetail> TransactionDetails { get; set; } = new List<TransactionDetail>();
}
