namespace SkillUp.BussinessObjects.DTOs.DoQuiz
{
    public class QuizResultSummaryDto
    {
        public Guid SubmissionId { get; set; } 
        public decimal? Score { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime? EndedAt { get; set; }
        public bool IsPassed { get; set; }
    }
}
