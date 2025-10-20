using System;
using System.Collections.Generic;

namespace SkillUp.BussinessObjects.Models;

public partial class QuestionQuiz
{
    public Guid Id { get; set; }

    public Guid QuestionBankId { get; set; }

    public Guid QuizId { get; set; }

    public virtual QuestionBank QuestionBank { get; set; } = null!;

    public virtual Quiz Quiz { get; set; } = null!;
}
