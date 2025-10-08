using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class QuestionBank
{
    public Guid Id { get; set; }

    public Guid SectionId { get; set; }

    public Guid AccountId { get; set; }

    public Guid CourseId { get; set; }

    public string Title { get; set; } = null!;

    public string Description { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public bool IsActive { get; set; }

    public virtual ICollection<AnswerBank> AnswerBanks { get; set; } = new List<AnswerBank>();

    public virtual Course Course { get; set; } = null!;

    public virtual ICollection<QuestionQuiz> QuestionQuizzes { get; set; } = new List<QuestionQuiz>();

    public virtual ICollection<QuizAnswerSubmission> QuizAnswerSubmissions { get; set; } = new List<QuizAnswerSubmission>();

    public virtual ICollection<QuizAnswer> QuizAnswers { get; set; } = new List<QuizAnswer>();

    public virtual Section Section { get; set; } = null!;
}
