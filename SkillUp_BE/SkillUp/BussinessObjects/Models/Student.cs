using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class Student
{
    public Guid Id { get; set; }

    public Guid AccountId { get; set; }

    public virtual Account Account { get; set; } = null!;

    public virtual Cart? Cart { get; set; }

    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    public virtual ICollection<QuizSubmission> QuizSubmissions { get; set; } = new List<QuizSubmission>();

    public virtual ICollection<Rating> Ratings { get; set; } = new List<Rating>();

    public virtual ICollection<ReportCourse> ReportCourses { get; set; } = new List<ReportCourse>();

    public virtual ICollection<StudentProgress> StudentProgresses { get; set; } = new List<StudentProgress>();
}
