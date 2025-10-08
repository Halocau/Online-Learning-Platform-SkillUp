using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class PermissionDetail
{
    public int Id { get; set; }

    public int PermissionId { get; set; }

    public string ActionName { get; set; } = null!;

    public string ActionCode { get; set; } = null!;

    public bool IsActive { get; set; }

    public virtual Permission Permission { get; set; } = null!;
}
