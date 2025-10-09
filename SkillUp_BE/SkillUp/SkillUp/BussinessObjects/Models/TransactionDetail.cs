using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class TransactionDetail
{
    public Guid Id { get; set; }

    public Guid CourseId { get; set; }

    public Guid TransactionId { get; set; }

    public decimal Price { get; set; }

    public virtual Course Course { get; set; } = null!;

    public virtual Transaction Transaction { get; set; } = null!;
}
