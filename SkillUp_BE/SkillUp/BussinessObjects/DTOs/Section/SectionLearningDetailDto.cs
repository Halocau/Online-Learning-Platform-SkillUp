namespace SkillUp.BussinessObjects.DTOs.Section
{
    public class SectionLearningDetailDto
    {
        public Guid Id { get; set; }
        public double? Orders { get; set; }
        public string Title { get; set; } = "";
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Danh sách items cho learning (có IsCompleted và QuizSubmissionId)
        public List<SectionItemLearningDto> Items { get; set; } = new();
    }
}

