using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class TransactionDetail
{
    public Guid Id { get; set; }

    public string CourseId { get; set; } = null!;

    public Guid TransactionId { get; set; }

    public decimal Price { get; set; }

    public virtual Transaction Transaction { get; set; } = null!;
}
