using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class LecturerApplication
{
    public Guid Id { get; set; }

    public Guid? AccountId { get; set; }

    public string? Cv { get; set; }

    public string? Degree { get; set; }

    public string Status { get; set; } = null!;

    public string? Reason { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Account? Account { get; set; }
}
