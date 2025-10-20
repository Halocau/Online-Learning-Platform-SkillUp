using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Otp
{
    public Guid Id { get; set; }

    public string? OtpLink { get; set; }

    public DateTime? OtpExpiry { get; set; }

    public Guid AccountId { get; set; }

    public bool IsUsed { get; set; }

    public DateTime? UsedAt { get; set; }

    public virtual Account Account { get; set; } = null!;
}
