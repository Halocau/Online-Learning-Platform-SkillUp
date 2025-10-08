using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Post
{
    public Guid Id { get; set; }

    public Guid AccountId { get; set; }

    public int ForumCategoryId { get; set; }

    public string Title { get; set; } = null!;

    public string Contents { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public string Status { get; set; } = null!;

    public virtual Account Account { get; set; } = null!;

    public virtual ForumCategory ForumCategory { get; set; } = null!;

    public virtual ICollection<PostImage> PostImages { get; set; } = new List<PostImage>();
}
