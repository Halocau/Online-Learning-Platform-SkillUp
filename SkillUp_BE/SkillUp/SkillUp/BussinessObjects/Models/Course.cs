using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Course
{
    public Guid Id { get; set; }

    public string? Title { get; set; }

    public string? Description { get; set; }

    public string? Image { get; set; }

    public decimal? Price { get; set; }

    public int EnrollmentCount { get; set; }

    public double? Rating { get; set; }

    public string? Status { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public int? CategoryId { get; set; }

    public virtual Category? Category { get; set; }

    public virtual ICollection<CourseImage> CourseImages { get; set; } = new List<CourseImage>();

    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    public virtual ICollection<QuestionBank> QuestionBanks { get; set; } = new List<QuestionBank>();

    public virtual ICollection<Rating> Ratings { get; set; } = new List<Rating>();

    public virtual ICollection<TransactionDetail> TransactionDetails { get; set; } = new List<TransactionDetail>();

    public virtual ICollection<Voucher> Vouchers { get; set; } = new List<Voucher>();
}
