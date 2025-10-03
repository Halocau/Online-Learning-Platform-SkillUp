using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Voucher
{
    public Guid Id { get; set; }

    public int VourcherType { get; set; }

    public string CouponCode { get; set; } = null!;

    public DateTime? StartTime { get; set; }

    public DateTime? EndTime { get; set; }

    public decimal Price { get; set; }

    public Guid? CourseId { get; set; }

    public bool IsActive { get; set; }

    public virtual Course? Course { get; set; }

    public virtual VoucherType VourcherTypeNavigation { get; set; } = null!;
}
