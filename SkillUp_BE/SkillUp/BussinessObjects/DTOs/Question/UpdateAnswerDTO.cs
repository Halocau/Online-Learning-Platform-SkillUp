namespace SkillUp.BussinessObjects.DTOs.Question
{
    public class UpdateAnswerDTO
    {
        public Guid? AnswerId { get; set; }     
        public string AnswerName { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
}
