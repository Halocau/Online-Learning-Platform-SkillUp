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

    public int? SubCategoryId { get; set; }

    public Guid LecturerId { get; set; }

    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();

    public virtual ICollection<CourseImage> CourseImages { get; set; } = new List<CourseImage>();

    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    public virtual Lecturer Lecturer { get; set; } = null!;

    public virtual ICollection<Rating> Ratings { get; set; } = new List<Rating>();

    public virtual ICollection<ReportCourse> ReportCourses { get; set; } = new List<ReportCourse>();

    public virtual ICollection<Section> Sections { get; set; } = new List<Section>();

    public virtual ICollection<StudentProgress> StudentProgresses { get; set; } = new List<StudentProgress>();

    public virtual SubCategory? SubCategory { get; set; }

    public virtual ICollection<TransactionDetail> TransactionDetails { get; set; } = new List<TransactionDetail>();

    public virtual ICollection<Voucher> Vouchers { get; set; } = new List<Voucher>();
}
