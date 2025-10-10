using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Permission
{
    public int Id { get; set; }

    public string ActionName { get; set; } = null!;

    public string ActionCode { get; set; } = null!;

    public bool IsActive { get; set; }

    public virtual ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}
