using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class RefreshToken
{
    public Guid Id { get; set; }

    public string Token { get; set; } = null!;

    public DateTime CreatedUtc { get; set; }

    public DateTime ExpiresUtc { get; set; }

    public DateTime? RevokedUtc { get; set; }

    public Guid AccountId { get; set; }

    public virtual Account Account { get; set; } = null!;
}
