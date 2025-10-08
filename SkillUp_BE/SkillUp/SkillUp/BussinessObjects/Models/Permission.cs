using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Permission
{
    public int Id { get; set; }

    public string? Name { get; set; }

    public virtual ICollection<AccountPermission> AccountPermissions { get; set; } = new List<AccountPermission>();

    public virtual ICollection<PermissionDetail> PermissionDetails { get; set; } = new List<PermissionDetail>();
}
