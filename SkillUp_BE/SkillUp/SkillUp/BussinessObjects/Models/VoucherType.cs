using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class VoucherType
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public int Percent { get; set; }

    public virtual ICollection<Voucher> Vouchers { get; set; } = new List<Voucher>();
}
