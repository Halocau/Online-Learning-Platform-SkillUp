using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class AccountPermission
{
    public int Id { get; set; }

    public int PermissionId { get; set; }

    public Guid AccountId { get; set; }

    public bool Licensed { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual Permission Permission { get; set; } = null!;
}
